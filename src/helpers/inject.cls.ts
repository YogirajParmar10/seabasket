type UtilityClass<T> = new () => T;

export function InjectCls<T>(utilityClass: UtilityClass<T>): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    Object.defineProperty(target, propertyKey, {
      get() {
        // eslint-disable-next-line new-cap
        const utilityInstance = new utilityClass();

        Object.defineProperty(this, propertyKey, {
          value: utilityInstance,
          enumerable: true,
          writable: true,
        });
        return utilityInstance;
      },
      enumerable: true,
      configurable: true,
    });
  };
}
