import { TestBed } from '@angular/core/testing';

import { GeneralCategoryService } from './general-category.service';

describe('GeneralCategoryService', () => {
  let service: GeneralCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeneralCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
