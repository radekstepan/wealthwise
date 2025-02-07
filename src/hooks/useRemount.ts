import { useContext } from "react";
import { RemountContext } from "../providers/RemountProvider";

export const useRemount = () => useContext(RemountContext);
