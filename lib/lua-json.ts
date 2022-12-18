/**
 * This is a TypeScript conversion of the lua-json package
 * (https://github.com/kcwiki/lua-json). This copy addresses an issue wherein a
 * value set to undefined in an object throws an Error. A pull request has been
 * raised on the project (https://github.com/kcwiki/lua-json/pull/8) so this
 * copy will be used until that it accepted and merged.
 */
import {
  isNull,
  isBoolean,
  isNumber,
  isString,
  isArray,
  isEmpty,
  keys,
  repeat,
} from "lodash";

const formatLuaString = (str: string, singleQuote: boolean) =>
  singleQuote
    ? `'${str.replace(/'/g, "\\'")}'`
    : `"${str.replace(/"/g, '\\"')}"`;

const valueKeys = new Map([
  ["false", "false"],
  ["true", "true"],
  ["null", "nil"],
]);

const formatLuaKey = (str: string, singleQuote: boolean) =>
  valueKeys.get(str)
    ? `[${valueKeys.get(str)}]`
    : str.match(/^[a-zA-Z_][a-zA-Z_0-9]*$/)
    ? str
    : `[${formatLuaString(str, singleQuote)}]`;

export const format = (
  value: object,
  options = { eol: "\n", singleQuote: true, spaces: 2 }
) => {
  options = options || {};
  const eol = (options.eol = isString(options.eol) ? options.eol : "\n");
  options.singleQuote = isBoolean(options.singleQuote)
    ? options.singleQuote
    : true;
  options.spaces =
    isNull(options.spaces) ||
    isNumber(options.spaces) ||
    isString(options.spaces)
      ? options.spaces
      : 2;

  const rec = (value: unknown, i = 0): string => {
    if (isNull(value)) {
      return "nil";
    }
    if (typeof value === "boolean" || typeof value === "number") {
      return value.toString();
    }
    if (typeof value === "string") {
      return formatLuaString(value, options.singleQuote);
    }
    if (isArray(value)) {
      if (isEmpty(value)) {
        return "{}";
      }
      if (options.spaces) {
        const spaces = isNumber(options.spaces)
          ? repeat(" ", options.spaces * (i + 1))
          : repeat(options.spaces, i + 1);
        const spacesEnd = isNumber(options.spaces)
          ? repeat(" ", options.spaces * i)
          : repeat(options.spaces, i);
        return `{${eol}${value
          .map((e) => `${spaces}${rec(e, i + 1)},`)
          .join(eol)}${eol}${spacesEnd}}`;
      }
      return `{${value.map((e) => `${rec(e, i + 1)},`).join("")}}`;
    }
    if (typeof value === "object") {
      if (isEmpty(value)) {
        return "{}";
      }
      let converted: string;
      if (options.spaces) {
        const spaces = isNumber(options.spaces)
          ? repeat(" ", options.spaces * (i + 1))
          : repeat(options.spaces, i + 1);
        const spacesEnd = isNumber(options.spaces)
          ? repeat(" ", options.spaces * i)
          : repeat(options.spaces, i);
        converted = `{${eol}${keys(value)
          .map((key) =>
            value[key] === undefined
              ? undefined
              : `${spaces}${formatLuaKey(key, options.singleQuote)} = ${rec(
                  value[key],
                  i + 1
                )},`
          )
          .join(eol)}${eol}${spacesEnd}}`;
        do {
          converted = converted.replace("\n\n", "\n");
        } while (converted.match("\n\n"));
        return converted;
      }
      converted = `{${keys(value)
        .map((key) =>
          value[key] === undefined
            ? undefined
            : `${formatLuaKey(key, options.singleQuote)}=${rec(
                value[key],
                i + 1
              )},`
        )
        .join("")}}`;
      do {
        converted = converted.replace("\n\n", "\n");
      } while (converted.match("\n\n"));
      return converted;
    }
    throw new Error(`can't format ${typeof value}`);
  };

  return `return${options.spaces ? " " : ""}${rec(value)}`;
};
