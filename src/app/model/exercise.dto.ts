import { IDocument } from "./document";

export class Exercise implements IDocument {
  id: string = "";
  name: string = "";
  type: string = "";
  muscle: string = "";
  submuscle: string = "";
  comment: string = "";
  mode: { name: string; item?: { name: string; subItem?: string } } = {
    name: "",
  };
  video?: string = "";
}
