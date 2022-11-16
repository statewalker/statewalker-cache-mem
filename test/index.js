import expect from 'expect.js';
import { LRU } from '../src/SimpleLru.js';

describe('LRU', () => {

  it('basic', () => {
    var cache = new LRU({ max: 10 })
    cache.set('key', 'value')
    expect(cache.get('key')).to.eql('value');
    expect(cache.get('nada')).to.be(undefined);
    expect(cache.size).to.be(1);
    expect(cache.max).to.be(10)

    cache.del('key');
    expect(cache.get('key')).to.be(undefined);
    expect(cache.get('nada')).to.be(undefined);
    expect(cache.size).to.be(0);
  })

  it('least recently set', () => {
    var cache = new LRU({ max : 2 })
    expect(cache.max).to.be(2);
    expect(cache.size).to.be(0);
    cache.set('a', 'A')
    expect(cache.size).to.be(1);
    cache.set('b', 'B')
    expect(cache.size).to.be(2);
    cache.set('c', 'C')
    expect(cache.size).to.be(2);
    expect(cache.get('c')).to.eql('C');
    expect(cache.get('b')).to.eql('B');
    expect(cache.get('a')).to.be(undefined);
  })

  it('lru recently gotten', async () => {
    var cache = new LRU({ max : 2 })
    cache.set('a', 'A')
    cache.set('b', 'B')
    await timeout(30);
    cache.get('a')
    cache.set('c', 'C')
    expect(cache.get('c')).to.eql('C');
    expect(cache.get('b')).to.be(undefined);
    expect(cache.get('a')).to.be('A');
  })

  it('del', () => {
    var cache = new LRU({ max : 2 })
    expect(cache.size).to.be(0);
    cache.set('a', 'A')
    expect(cache.size).to.be(1);
    cache.del('a')
    expect(cache.size).to.be(0);
    expect(cache.get('a')).to.be(undefined);
  })

  it('reset', () => {
    var cache = new LRU({ max : 10 })
    cache.set('a', 'A');
    cache.set('b', 'B');
    cache.reset();
    expect(cache.size).to.be(0);
    expect(cache.max).to.be(10);
    expect(cache.get('a')).to.be(undefined);
    expect(cache.get('b')).to.be(undefined);
  })

  async function timeout(t) { return new Promise(y => setTimeout(y, t)); }

  it('drop the old items', async () => {
    let n = process.env.CI ? 100 : 30
    let cache = new LRU({
      max: 5,
      maxAge: n * 2
    })

    cache.set('a', 'A')
    await timeout(n);

    cache.set('b', 'B')
    expect(cache.get('a')).to.eql('A');
    expect(cache.get('b')).to.eql('B');

    await timeout(n * 3);
    cache.set('c', 'C')
    // timed out
    expect(cache.get('a')).to.be(undefined);
    expect(cache.get('b')).to.be(undefined);
    expect(cache.get('c')).to.eql('C');

    await timeout(n);
    expect(cache.get('b')).to.be(undefined);
    expect(cache.get('c')).to.eql('C');

    await timeout(n * 3);
    expect(cache.get('c')).to.be(undefined);
  })

  it('manual pruning', async () => {
    let cache = new LRU({
      max: 5,
      maxAge: 50
    })

    cache.set('a', 'A');
    cache.set('b', 'b');
    cache.set('c', 'C');

    await timeout(100);
    expect(cache.size).to.eql(3);
    cache.prune();
    expect(cache.size).to.eql(0);

    expect(cache.get('a')).to.be(undefined);
    expect(cache.get('b')).to.be(undefined);
    expect(cache.get('c')).to.be(undefined);
  })


})
