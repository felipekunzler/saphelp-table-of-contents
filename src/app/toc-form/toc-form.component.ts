import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-toc-form',
  templateUrl: './toc-form.component.html',
  styleUrls: ['./toc-form.component.scss']
})
export class TocFormComponent {

  tocForm;

  constructor(
    private formBuilder: FormBuilder,
  ) {
    this.tocForm = this.formBuilder.group({
      code: '',
      version: ''
    });
  }

  onSubmit(tocFormData) {
    console.log(tocFormData);
  }

}
