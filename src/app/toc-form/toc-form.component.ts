import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { TocService } from '../toc.service';
import { TocNode } from '../toc-node';

@Component({
  selector: 'app-toc-form',
  templateUrl: './toc-form.component.html',
  styleUrls: ['./toc-form.component.scss']
})
export class TocFormComponent implements OnInit {

  tocForm;
  links: TocNode[] = [];
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private tocService: TocService,
  ) {
    this.tocForm = this.formBuilder.group({
      product: 'SAP_COMMERCE',
      version: '1905'
    });
  }

  ngOnInit() {
    this.onSubmit(this.tocForm.value);
  }

  onSubmit(tocFormData) {
    this.loading = true;
    this.links = [];
    const observable = this.tocService.buildTocTree(tocFormData.product, tocFormData.version);
    observable.subscribe({
        next: toc => {
          this.links.push(toc);
          this.links.sort((a, b) => a.name.localeCompare(b.name));
        },
        complete: () => this.loading = false
      }
    );
  }

  onExpandAllPagesClick() {
    this.links.forEach(link => this.tocService.onExpandAllClick(link));
  }

  onCollapseAllPagesClick() {
    for (const link of this.links) {
      for (const child of link.children) {
        this.tocService.onCollapseAllClick(child);
      }
    }
  }

}
