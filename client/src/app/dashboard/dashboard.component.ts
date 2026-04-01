import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthUser } from '../models/auth.model';
import { Todo, TodoPayload } from '../models/todo.model';
import { AiService } from '../services/ai.service';
import { AuthService } from '../services/auth.service';
import { TodoService } from '../services/todo.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  todos: Todo[] = [];
  currentUser: AuthUser | null = null;
  isLoading = false;
  isSaving = false;
  isGeneratingDescription = false;
  errorMessage = '';
  newTodo: TodoPayload = {
    title: '',
    description: ''
  };

  constructor(
    private readonly todoService: TodoService,
    private readonly authService: AuthService,
    private readonly aiService: AiService
  ) {}

  get completedCount(): number {
    return this.todos.filter((todo) => todo.completed).length;
  }

  get pendingCount(): number {
    return this.todos.length - this.completedCount;
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    this.loadTodos();
  }

  loadTodos(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.todoService.getTodos().subscribe({
      next: (todos) => {
        this.todos = todos;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.error?.message ?? 'Unable to load todos right now.';
        this.isLoading = false;
      }
    });
  }

  addTodo(): void {
    const title = this.newTodo.title.trim();
    const description = this.newTodo.description?.trim() ?? '';

    if (!title) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    this.todoService.createTodo({ title, description }).subscribe({
      next: (todo) => {
        this.todos = [todo, ...this.todos];
        this.newTodo = { title: '', description: '' };
        this.isSaving = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.error?.message ?? 'Unable to create the todo right now.';
        this.isSaving = false;
      }
    });
  }

  suggestDescription(): void {
    const title = this.newTodo.title.trim();

    if (!title) {
      this.errorMessage = 'Add a task title first, then ask Gemini for help.';
      return;
    }

    this.isGeneratingDescription = true;
    this.errorMessage = '';

    this.aiService.suggestDescription(title).subscribe({
      next: (response) => {
        this.newTodo.description = response.description;
        this.isGeneratingDescription = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.error?.message ?? 'Unable to generate a description right now.';
        this.isGeneratingDescription = false;
      }
    });
  }
}
