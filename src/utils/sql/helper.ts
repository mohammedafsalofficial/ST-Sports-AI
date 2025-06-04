import { createClient } from "../supabase/server";

export const sanitizeSQL = (sql: string): string => {
  return sql.trim().replace(/;$/, "");
};

export const executeSQL = async (query: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("run_any_sql", {
    sql_query: sanitizeSQL(query),
  });

  if (error) throw error;
  return data;
};
