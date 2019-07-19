import { TocNode } from 'src/app/toc-node';

const links: TocNode[] = [
  {
    name: 'a1',
    visible: true,
    children: [
      {
        name: 'b2',
        visible: true,
        children: [
          {
            name: 'c1',
            visible: true,
            children: []
          }
        ]
      },
      {
        name: 'b1',
        visible: true,
        children: []
      },
    ]
  },
  {
    name: 'aa1',
    visible: true,
    children: [
      {
        name: 'bb2',
        visible: true,
        children: [
          {
            name: 'cc1',
            visible: true,
            children: []
          }
        ]
      },
      {
        name: 'bb1',
        visible: true,
        children: []
      },
    ]
  }
];

export default links;
