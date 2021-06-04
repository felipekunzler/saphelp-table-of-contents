import { TocNode } from 'src/app/types';

const links: TocNode[] = [
  {
    name: 'a1',
    link: 'https://google.com',
    visible: true,
    title: '',
    children: [
      {
        name: 'b2',
        link: 'https://google.com',
        visible: true,
        title: '',
        children: [
          {
            name: 'c1',
            link: 'https://google.com',
            title: '',
            visible: true,
            children: [],
          }
        ]
      },
      {
        name: 'b1',
        link: 'https://google.com',
        visible: true,
        title: '',
        children: []
      },
    ]
  },
  {
    name: 'aa1',
    link: 'https://google.com',
    visible: true,
    title: '',
    children: [
      {
        name: 'bb2',
        link: 'https://google.com',
        visible: true,
        title: '',
        children: [
          {
            name: 'cc1',
            link: 'https://google.com',
            visible: true,
            title: '',
            children: []
          }
        ]
      },
      {
        name: 'bb1',
        link: 'https://google.com',
        visible: true,
        title: '',
        children: []
      },
    ]
  }
];

export default links;
