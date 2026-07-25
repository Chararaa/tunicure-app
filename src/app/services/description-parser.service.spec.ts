import { TestBed } from '@angular/core/testing';

import { DescriptionParserService } from './description-parser.service';

describe('DescriptionParserService', () => {
  let service: DescriptionParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DescriptionParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
