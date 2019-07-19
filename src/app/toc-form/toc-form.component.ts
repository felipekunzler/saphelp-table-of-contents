import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { TocService } from '../toc.service';
import mockLinks from '../../mock/links';
import { TocNode } from '../toc-node';

@Component({
  selector: 'app-toc-form',
  templateUrl: './toc-form.component.html',
  styleUrls: ['./toc-form.component.scss']
})
export class TocFormComponent {

  tocForm;
  links: TocNode[] = mockLinks;

  constructor(
    private formBuilder: FormBuilder,
    private tocService: TocService,
  ) {
    this.tocForm = this.formBuilder.group({
      code: '',
      version: ''
    });
  }

  onSubmit(tocFormData) {
    this.links = [];
    const observable = this.tocService.buildTocTree(tocFormData.code, tocFormData.version);
    observable.subscribe(toc => this.links.push(toc));
  }

}
