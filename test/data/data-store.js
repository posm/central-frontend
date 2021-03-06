import faker from '../faker';

// An array-like collection of objects. Objects may be created, read, sorted,
// and deleted. The objects are ordered within the collection in order of
// creation.
class Collection {
  /* eslint-disable no-unused-vars */

  // Generates an object and adds it to the collection. If the object has a
  // createdAt property, it will be in the past. Returns the collection for
  // chaining.
  createPast(count, options = undefined) { throw new Error('not implemented'); }
  // Generates an object and adds it to the collection. If the object has a
  // createdAt property, it will be set to the current time. Returns the new
  // object.
  createNew(options = undefined) { throw new Error('not implemented'); }
  // Returns the number of objects in the store.
  get size() { throw new Error('not implemented'); }
  // Returns the object at the specified index.
  get(index) { throw new Error('not implemented'); }
  // Returns the objects of the collection as an Array that is sorted in some
  // way (in order of creation or otherwise).
  sorted() { throw new Error('not implemented'); }
  splice(start, deleteCount) { throw new Error('not implemented'); }

  /* eslint-enable no-unused-vars */

  first() { return this.size !== 0 ? this.get(0) : undefined; }
  last() { return this.size !== 0 ? this.get(this.size - 1) : undefined; }

  random() {
    if (this.size === 0) return undefined;
    return this.get(faker.random.number({ max: this.size - 1 }));
  }

  firstOrCreatePast() {
    if (this.size === 0) this.createPast(1);
    return this.get(0);
  }

  randomOrCreatePast() {
    return this.size !== 0
      ? this.random()
      : this.createPast(1).get(0);
  }
}

// Implements the methods of Collection.
class Store extends Collection {
  constructor({
    // A factory function that generates objects for the store. createPast() and
    // createNew() pass arguments to the factory; see _create() for details.
    factory,
    // A compare function that sorted() will use to sort the objects in the
    // store
    sort = undefined
  }) {
    super();
    // When we run the callback later, we do not want it to be bound to the
    // Store.
    this._factory = factory.bind(null);
    this._compareFunction = sort;
    this.reset();
  }

  reset() {
    this._objects = [];
    this._createdNew = false;
    this._id = 0;
    this._lastCreatedAt = null;
  }

  createPast(count, options = undefined) {
    if (count === 0) return this;
    // We could remove this restriction, but it would require reworking
    // this._lastCreatedAt and maybe other things.
    if (this._createdNew)
      throw new Error('createPast() is not allowed after createNew()');
    for (let i = 0; i < count; i += 1)
      this._create(true, options);
    return this;
  }

  createNew(options = undefined) {
    const object = this._create(false, options);
    this._createdNew = true;
    return object;
  }

  _create(inPast, options = undefined) {
    this._id += 1;
    const object = this._factory({
      ...options,

      // We always pass the following arguments to the factory, but they might
      // not be relevant to all factories.

      // inPast is relevant to factories that return objects with a createdAt
      // property. If inPast is `true`, the createdAt property of the resulting
      // object should be in the past. If it is `false`, its createdAt property
      // should be set to the current time.
      inPast,
      // id is relevant to factories that return objects with an `id` property.
      id: this._id,
      // lastCreatedAt is relevant to factories that return objects with a
      // createdAt property. The createdAt property of the resulting object
      // should be greater than or equal to lastCreatedAt.
      lastCreatedAt: this._lastCreatedAt
    });
    this._objects.push(object);
    this._lastCreatedAt = object.createdAt;
    return object;
  }

  get size() { return this._objects.length; }
  get(index) { return this._objects[index]; }

  sorted() {
    const copy = [...this._objects];
    if (this._compareFunction != null) copy.sort(this._compareFunction);
    return copy;
  }

  splice(start, deleteCount) {
    return this._objects.splice(start, deleteCount);
  }

  // Updates an existing object in place, setting the properties specified by
  // `props`. If the object has an updatedAt property, it is set to the current
  // time. Returns the updated object.
  update(object, props) {
    if (Object.prototype.hasOwnProperty.call(props, 'createdAt')) {
      // Objects are ordered in the store in order of creation. If the factory
      // returns objects with a createdAt property, then the objects should also
      // be ordered by createdAt. (The order by createdAt should match the
      // actual order of creation.) Because of that, update() does not support
      // updating an object's createdAt property.
      throw new Error('createdAt cannot be updated');
    }
    Object.assign(object, props);
    if (Object.prototype.hasOwnProperty.call(object, 'updatedAt')) {
      // eslint-disable-next-line no-param-reassign
      object.updatedAt = new Date().toISOString();
    }
    return object;
  }
}

// A view/transformation of a Store
class View extends Collection {
  constructor(store, transform) {
    super();
    this._store = store;
    // When we run the callback later, we do not want it to be bound to the
    // View.
    this._transform = transform.bind(null);
  }

  createPast(count, options = undefined) {
    this._store.createPast(count, options);
    return this;
  }

  createNew(options = undefined) {
    return this._transform(this._store.createNew(options));
  }

  get size() { return this._store.size; }
  get(index) { return this._transform(this._store.get(index)); }

  sorted() {
    const sorted = this._store.sorted();
    for (let i = 0; i < sorted.length; i += 1)
      sorted[i] = this._transform(sorted[i]);
    return sorted;
  }

  splice(start, deleteCount) {
    return this._store.splice(start, deleteCount)
      .map(object => this._transform(object));
  }
}

const stores = [];

export const dataStore = (options) => {
  const store = new Store(options);
  stores.push(store);
  return store;
};

export const view = (store, transform) => new View(store, transform);

export const resetDataStores = () => {
  for (const store of stores)
    store.reset();
};
