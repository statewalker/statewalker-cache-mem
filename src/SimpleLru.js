export class LRU {

  constructor(options) {
    bindLruMethods(this, options);
  }

}

export function bindLruMethods(cache, { max = 100, maxAge = 1000 * 60 * 60, dispose = ()=>{} } = {}) {
  cache = Object.assign(cache, {
   max,
   maxAge,
   dispose,

   index : {},

   list : [],

   prune : function prune() {
     let now;
     while (this.list.length &&
            ((this.list.length > this.max)
            || ((now = now || this._now()) - this.list[0].stamp > this.maxAge))) {
       const slot = this.list.shift();
       delete this.index[slot.key];
       this.dispose(slot.key, slot.value);
     }
   },

   refresh : function (key) {
     const slot = this.index[key];
     if (slot) {
       slot.stamp = this._now();
       this.list.sort(this._compareSlots);
     }
     return slot;
   },

   set : function (key, value) {
     let slot = this.refresh(key);
     if (!slot) {
       this.list.push(slot = this.index[key] = { stamp : this._now(), key });
       this.list.sort(this._compareSlots);
     }
     slot.value = value;
     this.prune();
   },

   del : function (key) {
     let slot = this.index[key];
     if (!slot) return false;
     if (slot) {
       let idx = this.list.indexOf(slot);
       this.list.splice(idx, 1);
       delete this.index[slot.key];
       this.dispose(slot.key, slot.value);
     }
     this.prune();
   },

   get : function (key) {
     this.prune();
     const slot = this.refresh(key);
     return slot ? slot.value : undefined;
   },

   keys : function () {
     this.prune();
     return this.list.map(slot => slot.key);
   },

   reset : function() {
     const list = this.list;
     this.list = [];
     this.index = {};
     list.forEach((slot) => this.dispose(slot.key, slot.value));
   },

   close : function() {
     this.reset();
   },

   _compareSlots : function(a, b) {
     return a.stamp > b.stamp ? 1 : a.stamp < b.stamp ? -1 : 0;
   },

   _now : function() {
     return Date.now();
   },

 })
 Object.defineProperty(cache, 'size', {
   get : function() { return this.list.length; }
 })
 return cache;
}
