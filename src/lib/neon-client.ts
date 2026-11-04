import { getDb } from './db';

// Provide standard sql interface
const sql = (strings: TemplateStringsArray, ...values: any[]) => {
  return getDb()(strings, ...values);
};

export default sql;
