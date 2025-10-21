import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { RouterOutlet } from '@angular/router';

// Define the structure of a To-Do item
interface Todo {
  id: number;
  task: string;
  is_completed: boolean;
  created_at: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  // Import the modules this component needs
  imports: [CommonModule, RouterOutlet, HttpClientModule, FormsModule],
  // Point to your separate template and style files
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  title = 'todo-app';
  
  // Inject the HttpClient service for making API requests
  http = inject(HttpClient);

  // Base URL for your PHP API.
  // IMPORTANT: Replace this with the actual URL where your PHP files are hosted.
  // For local development with XAMPP, it might be 'http://localhost/api/'
  private apiUrl = 'http://localhost/api/'; // <--- CHANGE THIS

  // State management using Angular Signals
  todos = signal<Todo[]>([]);
  newTask = '';
  loading = signal(true);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.getTodos();
  }

  // Fetch all to-do items from the backend
  getTodos() {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.http.get<Todo[]>(`${this.apiUrl}get.php`)
      .pipe(
        catchError(err => {
          console.error('Error fetching todos:', err);
          this.errorMessage.set('Could not connect to the server. Make sure your PHP backend is running.');
          return of([]); // Return an empty array on error
        })
      )
      .subscribe(data => {
        this.todos.set(data);
        this.loading.set(false);
      });
  }

  // Add a new to-do item
  addTodo() {
    if (this.newTask.trim() === '') {
      return; // Prevent adding empty tasks
    }
    this.errorMessage.set(null);
    const taskData = { task: this.newTask };

    this.http.post<Todo>(`${this.apiUrl}add.php`, taskData)
      .pipe(
        catchError(err => {
          console.error('Error adding todo:', err);
          this.errorMessage.set('Failed to add the new task. Please try again.');
          return of(null);
        })
      )
      .subscribe(newTodo => {
        if (newTodo) {
          // Update the list with the new item from the server
          this.todos.update(currentTodos => [...currentTodos, newTodo]);
          this.newTask = ''; // Clear the input field
        }
      });
  }

  // Toggle the completion status of a to-do item
  toggleComplete(todo: Todo) {
    this.errorMessage.set(null);
    const updatedTodo = { ...todo, is_completed: !todo.is_completed };

    this.http.put(`${this.apiUrl}update.php`, { id: todo.id, is_completed: updatedTodo.is_completed })
      .pipe(
        catchError(err => {
          console.error('Error updating todo:', err);
          this.errorMessage.set('Failed to update the task status.');
          return of(null);
        })
      )
      .subscribe(response => {
        if (response !== null) {
          // Update the state locally for a responsive UI
           this.todos.update(currentTodos => 
             currentTodos.map(t => t.id === todo.id ? updatedTodo : t)
           );
        }
      });
  }

  // Delete a to-do item
  deleteTodo(id: number) {
    this.errorMessage.set(null);
    this.http.delete(`${this.apiUrl}delete.php`, { body: { id } })
      .pipe(
        catchError(err => {
          console.error('Error deleting todo:', err);
          this.errorMessage.set('Failed to delete the task.');
          return of(null);
        })
      )
      .subscribe(response => {
        if (response !== null) {
          // Update the list by filtering out the deleted item
          this.todos.update(currentTodos => currentTodos.filter(t => t.id !== id));
        }
      });
  }
}