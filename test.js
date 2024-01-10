

const mem = {
  prev: [1,2],
  dir: 0,
}

const newAttack = mem.prev;

const opp = Number( !mem.dir );
console.log(newAttack, opp);

