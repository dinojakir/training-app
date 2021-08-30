import { FlatTreeControl } from "@angular/cdk/tree";
import { Component, OnInit } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
} from "@angular/fire/firestore";
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from "@angular/material/tree";
import { BehaviorSubject } from "rxjs";

export class MuscleNode {
  item: string = "";
  children: MuscleNode[] = [];
}

export class MuscleFlatNode {
  item: string = "";
  level: number = 0;
  expandable: boolean = false;
}

export class MuscleDb {
  dataChange = new BehaviorSubject<MuscleNode[]>([]);

  get data(): MuscleNode[] {
    return this.dataChange.value;
  }

  deleteItem(parent: MuscleNode | undefined, name: string): void {
    if (parent && parent.children) {
      parent.children = parent.children.filter((j) => j.item !== name);
      this.dataChange.next(this.data);
    } else {
      this.dataChange.next(this.data.filter((i) => i.item !== name));
    }
  }

  insertItem(parent: MuscleNode | null, name: string): void {
    if (parent && parent.children) {
      parent.children.push({ item: name, children: [] } as MuscleNode);
      this.dataChange.next(this.data);
    }

    if (!parent) {
      this.data.push({ item: name, children: [] });
      this.dataChange.next(this.data);
    }
  }

  updateItem(node: MuscleNode, name: string): void {
    node.item = name;
    this.dataChange.next(this.data);
  }
}

@Component({
  selector: "app-configuration",
  templateUrl: "./configuration.component.html",
  styleUrls: ["./configuration.component.scss"],
})
export class ConfigurationComponent implements OnInit {
  flatNodeMap = new Map<MuscleFlatNode, MuscleNode>();
  nestedNodeMap = new Map<MuscleNode, MuscleFlatNode>();
  newItemName = "";
  treeControl: FlatTreeControl<MuscleFlatNode>;
  treeFlattener: MatTreeFlattener<MuscleNode, MuscleFlatNode>;
  dataSource: MatTreeFlatDataSource<MuscleNode, MuscleFlatNode>;
  muscleDb: MuscleDb;
  loadingVisible = false;
  isMusclesLoaded = false;

  constructor(private db: AngularFirestore) {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren
    );
    this.treeControl = new FlatTreeControl<MuscleFlatNode>(
      this.getLevel,
      this.isExpandable
    );
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener
    );

    this.muscleDb = new MuscleDb();
    this.muscleDb.dataChange.subscribe((data) => {
      this.dataSource.data = data;
    });
  }

  async ngOnInit(): Promise<void> {
    await this.getData();
    this.isMusclesLoaded = true;
  }

  getLevel = (node: MuscleFlatNode) => node.level;

  isExpandable = (node: MuscleFlatNode) => node.expandable;

  getChildren = (node: MuscleNode): MuscleNode[] => node.children;

  canAdd = (_: number, _nodeData: MuscleFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: MuscleFlatNode) =>
    _nodeData.item === "";

  transformer = (node: MuscleNode, level: number) => {
    const existingNode: MuscleFlatNode | undefined =
      this.nestedNodeMap.get(node);
    const flatNode: MuscleFlatNode =
      existingNode && existingNode.item === node.item
        ? existingNode
        : new MuscleFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = !!node.children?.length;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);

    return flatNode;
  };

  async getData(): Promise<void> {
    const snaps: firebase.default.firestore.QuerySnapshot<unknown> =
      await this.db.collection("Muscles").get().toPromise();

    const muscles: MuscleNode[] = snaps.docs.map((snap) => {
      const snapData: Object = snap.data() as Object;
      return <MuscleNode>{
        item: snap.id,
        ...snapData,
      };
    });

    this.muscleDb.dataChange.next(muscles || []);
  }

  getParentNode(node: MuscleFlatNode): MuscleFlatNode | null {
    const currentLevel: number = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex: number = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i: number = startIndex; i >= 0; i--) {
      const currentNode: MuscleFlatNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }

    return null;
  }

  addNode(node: MuscleFlatNode): void {
    const parentNode: MuscleNode | undefined = this.flatNodeMap.get(node);
    this.muscleDb?.insertItem(parentNode!, "");
    this.treeControl.expand(node);
  }

  saveNode(node: MuscleFlatNode, itemValue: string): void {
    const nestedNode: MuscleNode | undefined = this.flatNodeMap.get(node);
    this.muscleDb?.updateItem(nestedNode!, itemValue);
  }

  deleteNode(node: MuscleFlatNode): void {
    const parentFlatNode: MuscleFlatNode | null = this.getParentNode(node);
    const parentNode: MuscleNode | undefined = this.flatNodeMap.get(
      parentFlatNode!
    );
    this.muscleDb.deleteItem(parentNode, node.item);
  }

  onNewGroupClick(): void {
    this.muscleDb.insertItem(null, "");
    console.log(this.muscleDb.data);
  }

  async onSaveClick(): Promise<void> {
    this.loadingVisible = true;

    const musclesRef: AngularFirestoreCollection =
      this.db.collection("Muscles");

    if (this.muscleDb && this.muscleDb.data.length > 0) {
      for (const muscle of this.muscleDb.data) {
        const muscleRef: AngularFirestoreDocument = musclesRef.doc(muscle.item);
        await muscleRef.set(muscle);
      }
    } else {
      musclesRef.ref.onSnapshot((snapshot) => {
        snapshot.docs.forEach((doc) => {
          musclesRef.doc(doc.id).delete();
        });
      });
    }

    this.loadingVisible = false;
  }
}
