{ pkgs }: {
  deps = [
    pkgs.postgresql_15
    pkgs.nodejs_20
  ];
  env = {
    DATABASE_URL = "postgresql://neondb_owner:D0aCKpUjrFf1@ep-divine-bush-a49hwonr.us-east-1.aws.neon.tech/neondb?sslmode=require";
  };
}
