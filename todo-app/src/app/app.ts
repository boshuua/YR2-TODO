import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

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
  imports: [CommonModule, HttpClientModule, FormsModule],
  template: `
    <!-- Main container for the to-do application -->
    <div class="font-sans text-white p-4 flex items-center justify-center min-h-screen">
      <div class="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
        
        <!-- Header Section -->
        <header class="mb-6 md:mb-8 text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-teal-400">TodoApp</h1>
          <p class="text-gray-400 mt-2">Powered by Angular, PHP & PostgreSQL</p>
        </header>

        <!-- Error Message Display -->
        @if (errorMessage()) {
          <div class="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6" role="alert">
            <strong class="font-bold">Oops!</strong>
            <span class="block sm:inline ml-2">{{ errorMessage() }}</span>
          </div>
        }

        <!-- Form to Add New To-Do Items -->
        <form (ngSubmit)="addTodo()" class="flex flex-col sm:flex-row gap-3 mb-6">
          <input 
            type="text"
            [(ngModel)]="newTask"
            name="newTask"
            placeholder="What needs to be done?"
            class="flex-grow bg-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200"
            required
          >
          <button 
            type="submit"
            [disabled]="!newTask.trim()"
            class="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
            </svg>
            Add Task
          </button>
        </form>

        <!-- To-Do List Section -->
        <section>
          <!-- Loading Spinner -->
          @if (loading()) {
            <div class="flex justify-center items-center p-8">
                <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-400"></div>
            </div>
          }

          <!-- Empty State Message -->
          @if (!loading() && todos().length === 0) {
            <div class="text-center bg-gray-700/50 rounded-lg p-8">
              <p class="text-gray-400">No tasks yet. Add one above to get started!</p>
            </div>
          }

          <!-- List of To-Do Items -->
          <ul class="space-y-3">
            @for (todo of todos(); track todo.id) {
              <li 
                class="flex items-center bg-gray-700 rounded-lg p-4 transition duration-300 hover:bg-gray-600/50"
                [class.opacity-50]="todo.is_completed"
              >
                <input 
                  type="checkbox"
                  [checked]="todo.is_completed"
                  (change)="toggleComplete(todo)"
                  class="form-checkbox h-6 w-6 rounded-md bg-gray-800 border-gray-600 text-teal-500 focus:ring-teal-600 cursor-pointer"
                >
                <span 
                  class="ml-4 text-lg flex-grow"
                  [class.line-through]="todo.is_completed"
                  [class.text-gray-500]="todo.is_completed"
                >
                  {{ todo.task }}
                </span>
                <button 
                  (click)="deleteTodo(todo.id)"
                  class="text-gray-500 hover:text-red-500 transition duration-200 p-2 rounded-full"
                  aria-label="Delete task"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16">
                    <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm3.5-.029h.001l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm3.5-.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Z"/>
                  </svg>
                </button>
              </li>
            }
          </ul>
        </section>
      </div>
    </div>
  `,
  styles: [`
    /* Custom checkbox style to better fit the theme */
    .form-checkbox:checked {
      background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
    }
  `]
})
export class AppComponent implements OnInit {
  // Inject the HttpClient service for making API requests
  http = inject(HttpClient);

  // Base URL for your PHP API.
  private apiUrl = 'https://ws369808-todo.remote.ac//api/';

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
      return;
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
          this.todos.update(currentTodos => [...currentTodos, newTodo]);
          this.newTask = '';
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
          this.todos.update(currentTodos => currentTodos.filter(t => t.id !== id));
        }
      });
  }
}
