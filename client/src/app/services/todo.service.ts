import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Todo, TodoPayload } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private readonly apiUrl = `${environment.apiBaseUrl}/todos`;

  constructor(private readonly http: HttpClient) {}

  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.apiUrl);
  }

  createTodo(payload: TodoPayload): Observable<Todo> {
    return this.http.post<Todo>(this.apiUrl, payload);
  }

  updateTodo(todoId: string, payload: Partial<TodoPayload>): Observable<Todo> {
    return this.http.put<Todo>(`${this.apiUrl}/${todoId}`, payload);
  }

  deleteTodo(todoId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${todoId}`);
  }
}
