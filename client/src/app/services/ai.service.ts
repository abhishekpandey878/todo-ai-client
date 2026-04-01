import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private readonly apiUrl = `${environment.apiBaseUrl}/ai`;

  constructor(private readonly http: HttpClient) {}

  suggestDescription(title: string): Observable<{ description: string }> {
    return this.http.post<{ description: string }>(`${this.apiUrl}/description`, { title });
  }
}
