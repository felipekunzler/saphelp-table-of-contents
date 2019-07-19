import { TocNode } from 'src/app/toc-node';

const links: TocNode[] = [
  {
    name: 'a1',
    link: 'https://google.com',
    visible: true,
    children: [
      {
        name: 'b2',
        link: 'https://google.com',
        visible: true,
        children: [
          {
            name: 'c1',
            link: 'https://google.com',
            visible: true,
            children: []
          }
        ]
      },
      {
        name: 'b1',
        link: 'https://google.com',
        visible: true,
        children: []
      },
    ]
  },
  {
    name: 'aa1',
    link: 'https://google.com',
    visible: true,
    children: [
      {
        name: 'bb2',
        link: 'https://google.com',
        visible: true,
        children: [
          {
            name: 'cc1',
            link: 'https://google.com',
            visible: true,
            children: []
          }
        ]
      },
      {
        name: 'bb1',
        link: 'https://google.com',
        visible: true,
        children: []
      },
    ]
  }
];

export default links;
