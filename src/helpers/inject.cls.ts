type UtilityClass<T> = new () => T;

export function InjectCls<T>(utilityClass: UtilityClass<T>): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    Object.defineProperty(target, propertyKey, {
      get() {
        // Create an instance of the utility class
        // eslint-disable-next-line new-cap
        const utilityInstance = new utilityClass();
        // Set the class property to the utility instance
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
