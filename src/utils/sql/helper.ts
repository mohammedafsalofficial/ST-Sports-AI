export const sanitizeSQL = (sql: string): string => {
  return sql.trim().replace(/;$/, ""); // removes single trailing semicolon
};
