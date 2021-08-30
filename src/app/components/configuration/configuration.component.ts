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

export class Node {
  item: string = "";
  children: Node[] = [];
}

export class FlatNode {
  item: string = "";
  level: number = 0;
  expandable: boolean = false;
}

export class Db {
  dataChange = new BehaviorSubject<Node[]>([]);

  get data(): Node[] {
    return this.dataChange.value;
  }

  deleteItem(parent: Node | undefined, name: string): void {
    if (parent && parent.children) {
      parent.children = parent.children.filter((j) => j.item !== name);
      this.dataChange.next(this.data);
    } else {
      this.dataChange.next(this.data.filter((i) => i.item !== name));
    }
  }

  insertItem(parent: Node | null, name: string): void {
    if (parent && parent.children) {
      parent.children.push({ item: name, children: [] } as Node);
      this.dataChange.next(this.data);
    }

    if (!parent) {
      this.data.push({ item: name, children: [] });
      this.dataChange.next(this.data);
    }
  }

  updateItem(node: Node | undefined, name: string): void {
    if (node) {
      node.item = name;
      this.dataChange.next(this.data);
    }
  }
}

@Component({
  selector: "app-configuration",
  templateUrl: "./configuration.component.html",
  styleUrls: ["./configuration.component.scss"],
})
export class ConfigurationComponent implements OnInit {
  musclesFlatNodeMap = new Map<FlatNode, Node>();
  musclesNestedNodeMap = new Map<Node, FlatNode>();
  propsFlatNodeMap = new Map<FlatNode, Node>();
  propsNestedNodeMap = new Map<Node, FlatNode>();
  newItemName = "";
  musclesTreeControl: FlatTreeControl<FlatNode>;
  musclesTreeFlattener: MatTreeFlattener<Node, FlatNode>;
  musclesDataSource: MatTreeFlatDataSource<Node, FlatNode>;
  muscleDb: Db;
  propsTreeControl: FlatTreeControl<FlatNode>;
  propsTreeFlattener: MatTreeFlattener<Node, FlatNode>;
  propsDataSource: MatTreeFlatDataSource<Node, FlatNode>;
  propsDb: Db;
  loadingVisible = false;
  isMusclesLoaded = false;
  isPropsLoaded = false;

  constructor(private db: AngularFirestore) {
    this.musclesTreeFlattener = new MatTreeFlattener(
      this.musclesTransformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren
    );
    this.musclesTreeControl = new FlatTreeControl<FlatNode>(
      this.getLevel,
      this.isExpandable
    );
    this.musclesDataSource = new MatTreeFlatDataSource(
      this.musclesTreeControl,
      this.musclesTreeFlattener
    );

    this.muscleDb = new Db();
    this.muscleDb.dataChange.subscribe((data) => {
      this.musclesDataSource.data = data;
    });

    this.propsTreeFlattener = new MatTreeFlattener(
      this.propsTransformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren
    );
    this.propsTreeControl = new FlatTreeControl<FlatNode>(
      this.getLevel,
      this.isExpandable
    );
    this.propsDataSource = new MatTreeFlatDataSource(
      this.propsTreeControl,
      this.propsTreeFlattener
    );

    this.propsDb = new Db();
    this.propsDb.dataChange.subscribe((data) => {
      this.propsDataSource.data = data;
    });
  }

  async ngOnInit(): Promise<void> {
    const muscles: Node[] = await this.getData("Muscles");
    this.muscleDb.dataChange.next(muscles || []);
    this.isMusclesLoaded = true;

    const props: Node[] = await this.getData("Props");
    this.propsDb.dataChange.next(props || []);
    this.isPropsLoaded = true;
  }

  getLevel = (node: FlatNode) => node.level;

  isExpandable = (node: FlatNode) => node.expandable;

  getChildren = (node: Node): Node[] => node.children;

  canAdd = (_: number, _nodeData: FlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: FlatNode) => _nodeData.item === "";

  musclesTransformer = (node: Node, level: number) => {
    const existingNode: FlatNode | undefined =
      this.musclesNestedNodeMap.get(node);
    const flatNode: FlatNode =
      existingNode && existingNode.item === node.item
        ? existingNode
        : new FlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = !!node.children?.length;
    this.musclesFlatNodeMap.set(flatNode, node);
    this.musclesNestedNodeMap.set(node, flatNode);

    return flatNode;
  };

  propsTransformer = (node: Node, level: number) => {
    const existingNode: FlatNode | undefined =
      this.propsNestedNodeMap.get(node);
    const flatNode: FlatNode =
      existingNode && existingNode.item === node.item
        ? existingNode
        : new FlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = !!node.children?.length;
    this.propsFlatNodeMap.set(flatNode, node);
    this.propsNestedNodeMap.set(node, flatNode);

    return flatNode;
  };

  async getData(collection: string): Promise<Node[]> {
    const snaps: firebase.default.firestore.QuerySnapshot<unknown> =
      await this.db.collection(collection).get().toPromise();

    const documents: Node[] = snaps.docs.map((snap) => {
      const snapData: Object = snap.data() as Object;
      return <Node>{
        item: snap.id,
        ...snapData,
      };
    });

    return documents;
  }

  getParentNode(
    node: FlatNode,
    treeControl: FlatTreeControl<FlatNode>
  ): FlatNode | null {
    const currentLevel: number = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex: number = treeControl.dataNodes.indexOf(node) - 1;

    for (let i: number = startIndex; i >= 0; i--) {
      const currentNode: FlatNode = treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }

    return null;
  }

  addNode(node: FlatNode, dbName: string): void {
    switch (dbName) {
      case "MusclesDb": {
        const parentNode: Node | undefined = this.musclesFlatNodeMap.get(node);
        this.muscleDb.insertItem(parentNode!, "");
        this.musclesTreeControl.expand(node);
        break;
      }
      case "PropsDb": {
        const parentNode: Node | undefined = this.propsFlatNodeMap.get(node);
        this.propsDb.insertItem(parentNode!, "");
        this.propsTreeControl.expand(node);
        break;
      }
    }
  }

  saveNode(node: FlatNode, itemValue: string, dbName: string): void {
    switch (dbName) {
      case "MusclesDb": {
        const nestedNode: Node | undefined = this.musclesFlatNodeMap.get(node);
        this.muscleDb.updateItem(nestedNode!, itemValue);
        break;
      }
      case "PropsDb": {
        const nestedNode: Node | undefined = this.propsFlatNodeMap.get(node);
        console.log(nestedNode);
        this.propsDb.updateItem(nestedNode, itemValue);
        break;
      }
    }
  }

  deleteNode(node: FlatNode, dbName: string): void {
    switch (dbName) {
      case "MusclesDb": {
        const parentFlatNode: FlatNode | null = this.getParentNode(
          node,
          this.musclesTreeControl
        );
        const parentNode: Node | undefined = this.musclesFlatNodeMap.get(
          parentFlatNode!
        );
        this.muscleDb.deleteItem(parentNode, node.item);
        break;
      }
      case "PropsDb": {
        const parentFlatNode: FlatNode | null = this.getParentNode(
          node,
          this.propsTreeControl
        );
        const parentNode: Node | undefined = this.propsFlatNodeMap.get(
          parentFlatNode!
        );
        this.propsDb.deleteItem(parentNode, node.item);
        break;
      }
    }
  }

  onNewMuscleGroupClick(): void {
    this.muscleDb.insertItem(null, "");
  }

  onNewPropsGroupClick(): void {
    this.propsDb.insertItem(null, "");
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

    const propsRef: AngularFirestoreCollection = this.db.collection("Props");

    if (this.propsDb && this.propsDb.data.length > 0) {
      for (const prop of this.propsDb.data) {
        const propRef: AngularFirestoreDocument = propsRef.doc(prop.item);
        await propRef.set(prop);
      }
    } else {
      propsRef.ref.onSnapshot((snapshot) => {
        snapshot.docs.forEach((doc) => {
          propsRef.doc(doc.id).delete();
        });
      });
    }

    this.loadingVisible = false;
  }
}
