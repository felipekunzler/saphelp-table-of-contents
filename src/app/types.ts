export interface TocNode {
  name: string;
  link: string;
  visible: boolean;
  children: TocNode[];
  title: string;
}

export interface Product {
  name: string;
  code: string;
}

export interface Version {
  name: string;
  code: string;
}
