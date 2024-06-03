import { Database } from "arangojs";

const arango = new Database("http://localhost:8529");
const Users = arango.collection('users');

export { Users };
