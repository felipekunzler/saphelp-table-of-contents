export interface TocNode {
  name: string;
  link: string;
  visible: boolean;
  children: TocNode[];
  title: string;
}
