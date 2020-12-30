import { TestBed } from '@angular/core/testing';

import { McService } from './mc.service';

describe('McService', () => {
  let service: McService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(McService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
