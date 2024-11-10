{ pkgs }:
pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs-20
    pkgs.postgresql_15
    pkgs.glib
    pkgs.openssl_1_1
  ];
}
