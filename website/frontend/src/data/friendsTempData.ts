export type Friend = {
  name: string;
  image: string;
  mutualFriends: number;
  isFriend: boolean;
}

export const friendsTempData: Friend[] = [
  { name: 'Ana Ribeiro', image: 'https://picsum.photos/seed/friend1/100/100', mutualFriends: 12, isFriend: true },
  { name: 'Miguel Costa', image: 'https://picsum.photos/seed/friend2/100/100', mutualFriends: 7, isFriend: false },
  { name: 'Sofia Martins', image: 'https://picsum.photos/seed/friend3/100/100', mutualFriends: 19, isFriend: true },
  { name: 'Tiago Almeida', image: 'https://picsum.photos/seed/friend4/100/100', mutualFriends: 4, isFriend: false },
  { name: 'Ines Carvalho', image: 'https://picsum.photos/seed/friend5/100/100', mutualFriends: 15, isFriend: true },
  { name: 'Joao Ferreira', image: 'https://picsum.photos/seed/friend6/100/100', mutualFriends: 9, isFriend: false },
  { name: 'Marta Lopes', image: 'https://picsum.photos/seed/friend7/100/100', mutualFriends: 21, isFriend: true },
  { name: 'Rui Oliveira', image: 'https://picsum.photos/seed/friend8/100/100', mutualFriends: 6, isFriend: false },
  { name: 'Carla Santos', image: 'https://picsum.photos/seed/friend9/100/100', mutualFriends: 14, isFriend: true },
  { name: 'Bruno Pires', image: 'https://picsum.photos/seed/friend10/100/100', mutualFriends: 3, isFriend: false },
  { name: 'Laura Nunes', image: 'https://picsum.photos/seed/friend11/100/100', mutualFriends: 18, isFriend: true },
  { name: 'Andre Gomes', image: 'https://picsum.photos/seed/friend12/100/100', mutualFriends: 5, isFriend: false },
  { name: 'Patricia Rocha', image: 'https://picsum.photos/seed/friend13/100/100', mutualFriends: 11, isFriend: true },
  { name: 'Diogo Cardoso', image: 'https://picsum.photos/seed/friend14/100/100', mutualFriends: 8, isFriend: false },
  { name: 'Helena Pinto', image: 'https://picsum.photos/seed/friend15/100/100', mutualFriends: 16, isFriend: true },
  { name: 'Nuno Teixeira', image: 'https://picsum.photos/seed/friend16/100/100', mutualFriends: 10, isFriend: false },
]