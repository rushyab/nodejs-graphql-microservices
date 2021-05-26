export default function deepCopy<T>(source: T): T {
  if (Array.isArray(source)) {
    return (source.map((item) => deepCopy(item)) as unknown) as T;
  }

  if (source instanceof Date) {
    return (new Date(source.getTime()) as unknown) as T;
  }

  if (source && typeof source === 'object') {
    return Object.getOwnPropertyNames(source as Record<string, unknown>).reduce(
      (o, prop) => {
        Object.defineProperty(
          // add the property and its descriptors
          o,
          prop,
          Object.getOwnPropertyDescriptor(source, prop) as PropertyDescriptor,
        );

        o[prop] = deepCopy((source as Record<string, unknown>)[prop]); // recurse

        return o;
      },
      Object.create(Object.getPrototypeOf(source)),
    );
  }

  return source;
}
