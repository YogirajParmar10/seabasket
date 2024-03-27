import { validate } from "class-validator";

export class Validator {
  public static validate<T>(objType: new () => T) {
    // @ts-ignore
    return (req, res, next) => {
      const obj = this.createInstanceFromJson(objType, {
        ...req.body,
        ...req.params,
        _me: req.me,
      }) as any;
      // eslint-disable-next-line consistent-return
      validate(obj).then(err => {
        if (err.length) {
          // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
          const _error = err[0].constraints;
          const [first] = Object.keys(_error);
          const error = _error[first];
          return res.status(400).json({ error });
        }
        req.dto = obj;
        next();
      });
    };
  }

  private static createInstanceFromJson<T>(objType: new () => T, json: any) {
    // eslint-disable-next-line new-cap
    const newObj = new objType();
    // eslint-disable-next-line no-restricted-syntax
    for (const prop in json) {
      if ({}.propertyIsEnumerable.call(json, prop)) {
        // @ts-ignore
        newObj[prop] = json[prop];
      }
    }
    return newObj;
  }
}
