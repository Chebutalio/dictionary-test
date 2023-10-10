import { TestBed } from '@angular/core/testing';

import { DiagnosesServiceService } from './diagnoses.service.service';

describe('DiagnosesServiceService', () => {
  let service: DiagnosesServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiagnosesServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
