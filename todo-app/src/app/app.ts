import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { DragulaService, DragulaModule } from 'ng2-dragula'; // <-- ADD DragulaModule HERE

// --- DATA MODEL ---
interface Card {
  id: number;
  task: string;
  is_completed: boolean;
  created_at: string;
  list_id: number; 
}

interface KanbanList {
  list_id: number;
  list_name: string;
  list_order: number;
  tasks: Card[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  // FIX: DragulaModule MUST be imported here for the directive to be recognized
  imports: [CommonModule, HttpClientModule, FormsModule, DragulaModule], 
  templateUrl: './app.html', 
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  
  http = inject(HttpClient);
  private dragulaService = inject(DragulaService); // <-- Dragula Service Injection
  private apiUrl = 'http://localhost:8000/'; 

  board = signal<KanbanList[]>([]);
  newTaskText = '';
  loading = signal(true);
  errorMessage = signal<string | null>(null);

  constructor() {
    // Constructor handles Dragula setup and event subscription
    this.dragulaService.createGroup('kanban-board', {
      removeOnSpill: false
    });

    this.dragulaService.drop('kanban-board').subscribe(({ el, target, source }) => {
      const cardId = Number(el.getAttribute('data-card-id'));
      const targetListId = Number(target.id);
      this.moveCardToServer(cardId, targetListId);
    });
  }

  ngOnInit() {
    this.getBoard();
  }
  
  // *** REST OF THE METHODS (getBoard, addTodo, moveCardToServer, etc.) REMAIN THE SAME ***
  
  // Fetch the entire structured board
  getBoard() {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.http.get<KanbanList[]>(`${this.apiUrl}board.php`)
      .pipe(
        catchError(err => {
          console.error('Error fetching board:', err);
          this.errorMessage.set('Could not connect to the server or database.');
          return of([]);
        })
      )
      .subscribe(data => {
        this.board.set(data);
        this.loading.set(false);
      });
  }

  // Add a new task to the specified list
  addTodo(listId: number) {
    if (this.newTaskText.trim() === '') return;
    
    this.errorMessage.set(null);
    const taskData = { task: this.newTaskText, list_id: listId };

    this.http.post<Card>(`${this.apiUrl}add.php`, taskData)
      .pipe(
        catchError(err => {
          console.error('Error adding card:', err);
          this.errorMessage.set('Failed to add the new card.');
          return of(null);
        })
      )
      .subscribe(newCard => {
        if (newCard) {
          this.board.update(currentBoard => currentBoard.map(list => {
            if (list.list_id === listId) {
              return { ...list, tasks: [...list.tasks, newCard] };
            }
            return list;
          }));
          this.newTaskText = '';
        }
      });
  }

  // API call to update a card's list_id
  private moveCardToServer(cardId: number, newListId: number) {
    this.errorMessage.set(null);
    this.http.put(`${this.apiUrl}move.php`, { id: cardId, list_id: newListId })
      .pipe(
        catchError(err => {
          console.error('Error moving card:', err);
          this.errorMessage.set('Failed to move card on server. Refresh needed.');
          return of(null);
        })
      )
      .subscribe();
  }

  // Toggle card completion status
  toggleComplete(card: Card) {
    this.errorMessage.set(null);
    const updatedStatus = !card.is_completed;

    this.http.put(`${this.apiUrl}update.php`, { id: card.id, is_completed: updatedStatus })
      .pipe(
        catchError(err => {
          console.error('Error updating card status:', err);
          this.errorMessage.set('Failed to update task status.');
          return of(null);
        })
      )
      .subscribe(response => {
        if (response !== null) {
           this.board.update(currentBoard => 
             currentBoard.map(list => ({
                 ...list,
                 tasks: list.tasks.map(t => t.id === card.id ? { ...t, is_completed: updatedStatus } : t)
             }))
           );
        }
      });
  }

  // Delete a card
  deleteTodo(cardId: number) {
    this.errorMessage.set(null);
    this.http.delete(`${this.apiUrl}delete.php`, { body: { id: cardId } })
      .pipe(
        catchError(err => {
          console.error('Error deleting card:', err);
          this.errorMessage.set('Failed to delete the task.');
          return of(null);
        })
      )
      .subscribe(response => {
        if (response !== null) {
          this.board.update(currentBoard => 
            currentBoard.map(list => ({
                ...list,
                tasks: list.tasks.filter(t => t.id !== cardId)
            }))
          );
        }
      });
  }
}