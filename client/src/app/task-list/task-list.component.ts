import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { Todo } from '../models/todo.model';
import { AiService } from '../services/ai.service';
import { TodoService } from '../services/todo.service';

type FilterType = 'all' | 'completed' | 'pending';
type EditDraft = {
  title: string;
  description: string;
};

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  todos: Todo[] = [];
  isLoading = false;
  savingTodoId: string | null = null;
  generatingTodoId: string | null = null;
  editingTodoId: string | null = null;
  errorMessage = '';
  currentFilter: FilterType = 'all';
  editDraft: EditDraft = {
    title: '',
    description: ''
  };

  constructor(
    private readonly todoService: TodoService,
    private readonly route: ActivatedRoute,
    private readonly aiService: AiService
  ) {}

  get filteredTodos(): Todo[] {
    if (this.currentFilter === 'completed') {
      return this.todos.filter((todo) => todo.completed);
    }

    if (this.currentFilter === 'pending') {
      return this.todos.filter((todo) => !todo.completed);
    }

    return this.todos;
  }

  get pageTitle(): string {
    if (this.currentFilter === 'completed') {
      return 'Completed tasks';
    }

    if (this.currentFilter === 'pending') {
      return 'Pending tasks';
    }

    return 'All tasks';
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const filter = params.get('filter');
      this.currentFilter = filter === 'completed' || filter === 'pending' ? filter : 'all';
      this.loadTodos();
    });
  }

  loadTodos(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.editingTodoId = null;

    this.todoService.getTodos().subscribe({
      next: (todos) => {
        this.todos = todos;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.error?.message ?? 'Unable to load tasks right now.';
        this.isLoading = false;
      }
    });
  }

  toggleCompletion(todo: Todo): void {
    this.errorMessage = '';
    this.savingTodoId = todo._id;

    this.todoService.updateTodo(todo._id, { completed: !todo.completed }).subscribe({
      next: (updatedTodo) => {
        this.todos = this.todos.map((item) => (item._id === updatedTodo._id ? updatedTodo : item));
        this.savingTodoId = null;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.error?.message ?? 'Unable to update this task right now.';
        this.savingTodoId = null;
      }
    });
  }

  startEditing(todo: Todo): void {
    this.errorMessage = '';
    this.editingTodoId = todo._id;
    this.editDraft = {
      title: todo.title,
      description: todo.description ?? ''
    };
  }

  cancelEditing(): void {
    this.editingTodoId = null;
    this.editDraft = {
      title: '',
      description: ''
    };
  }

  saveEdit(todo: Todo): void {
    const title = this.editDraft.title.trim();
    const description = this.editDraft.description.trim();

    if (!title) {
      this.errorMessage = 'Task title cannot be empty.';
      return;
    }

    this.errorMessage = '';
    this.savingTodoId = todo._id;

    this.todoService.updateTodo(todo._id, { title, description }).subscribe({
      next: (updatedTodo) => {
        this.todos = this.todos.map((item) => (item._id === updatedTodo._id ? updatedTodo : item));
        this.savingTodoId = null;
        this.cancelEditing();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.error?.message ?? 'Unable to save this task right now.';
        this.savingTodoId = null;
      }
    });
  }

  suggestEditDescription(): void {
    const title = this.editDraft.title.trim();

    if (!title) {
      this.errorMessage = 'Add a task title first, then ask Gemini for help.';
      return;
    }

    if (!this.editingTodoId) {
      return;
    }

    this.errorMessage = '';
    this.generatingTodoId = this.editingTodoId;

    this.aiService.suggestDescription(title).subscribe({
      next: (response) => {
        this.editDraft.description = response.description;
        this.generatingTodoId = null;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.error?.message ?? 'Unable to generate a description right now.';
        this.generatingTodoId = null;
      }
    });
  }

  deleteTodo(todoId: string): void {
    this.errorMessage = '';
    this.savingTodoId = todoId;

    this.todoService.deleteTodo(todoId).subscribe({
      next: () => {
        this.todos = this.todos.filter((todo) => todo._id !== todoId);
        if (this.editingTodoId === todoId) {
          this.cancelEditing();
        }
        this.savingTodoId = null;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.error?.message ?? 'Unable to delete this task right now.';
        this.savingTodoId = null;
      }
    });
  }
}
