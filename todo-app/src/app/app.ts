import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { 
  CdkDragDrop, 
  moveItemInArray, 
  transferArrayItem,
  DragDropModule 
} from '@angular/cdk/drag-drop';

// --- DATA MODEL ---

// Define the structure of a single To-Do item (now a 'Card')
interface Card {
  id: number;
  task: string;
  is_completed: boolean;
  created_at: string;
  list_id: number; // Foreign key linking the card to its column
}

// Define the structure of a List (Column)
interface KanbanList {
  list_id: number;
  list_name: string;
  list_order: number;
  tasks: Card[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, DragDropModule], 
  templateUrl: './app.html', 
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  
  http = inject(HttpClient);
  // Ensure this URL is correct for your PHP server (e.g., http://localhost:8000/api/)
  private apiUrl = 'http://localhost:8000/api/'; 

  board = signal<KanbanList[]>([]);
  newTaskText = '';
  loading = signal(true);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.getBoard();
  }
  
  /**
   * FIX: This method performs array mapping logic outside the template binding.
   * It generates an array of all list IDs as strings for CDK cross-list connection.
   */
  getConnectedListIds(): string[] {
    return this.board().map(list => list.list_id.toString());
  }
  // ------------------------------------------


  // Fetch the entire structured board from the new board.php endpoint
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

  // Handles drag-and-drop logic
  drop(event: CdkDragDrop<Card[]>) {
    const targetListId = Number(event.container.id);
    
    if (event.previousContainer === event.container) {
      // Moving task within the same list
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Moving task to a different list (column transfer)
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      // Server Update (Update list_id)
      const movedCard = event.container.data[event.currentIndex];
      this.moveCardToServer(movedCard.id, targetListId);
    }
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