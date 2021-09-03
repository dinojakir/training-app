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
  edit?: boolean = false;
}

export class FlatNode {
  item: string = "";
  level: number = 0;
  expandable: boolean = false;
  edit?: boolean = false;
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

  insertItem(parent: Node | undefined, name: string): void {
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
      delete node.edit;
      this.dataChange.next(this.data);
    }
  }

  editItem(
    node: Node | undefined,
    parentNode: Node | undefined,
    edit: boolean
  ): void {
    if (parentNode && node) {
      const parentNodeEdit: Node | undefined = this.data.find(
        (i) => i.item === parentNode.item
      );

      if (parentNodeEdit) {
        const nodeEdit: Node | undefined = parentNodeEdit.children.find(
          (i) => i.item === node.item
        );
        if (nodeEdit) {
          if (edit) {
            nodeEdit.edit = true;
          } else {
            delete node.edit;
          }

          this.dataChange.next(this.data);
        }
      }
    } else {
      if (node) {
        const nodeEdit: Node | undefined = this.data.find(
          (i) => i.item === node.item
        );
        if (nodeEdit) {
          if (edit) {
            nodeEdit.edit = true;
          } else {
            delete node.edit;
          }

          this.dataChange.next(this.data);
        }
      }
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
  trainersFlatNodeMap = new Map<FlatNode, Node>();
  trainersNestedNodeMap = new Map<Node, FlatNode>();
  newItemName = "";
  musclesTreeControl: FlatTreeControl<FlatNode>;
  musclesTreeFlattener: MatTreeFlattener<Node, FlatNode>;
  musclesDataSource: MatTreeFlatDataSource<Node, FlatNode>;
  muscleDb: Db;
  propsTreeControl: FlatTreeControl<FlatNode>;
  propsTreeFlattener: MatTreeFlattener<Node, FlatNode>;
  propsDataSource: MatTreeFlatDataSource<Node, FlatNode>;
  propsDb: Db;
  trainersTreeControl: FlatTreeControl<FlatNode>;
  trainersTreeFlattener: MatTreeFlattener<Node, FlatNode>;
  trainersDataSource: MatTreeFlatDataSource<Node, FlatNode>;
  trainersDb: Db;
  loadingVisible = false;
  isMusclesLoaded = false;
  isPropsLoaded = false;
  isTrainersLoaded = false;

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
      this.musclesDataSource.data = [];
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
      this.propsDataSource.data = [];
      this.propsDataSource.data = data;
    });

    this.trainersTreeFlattener = new MatTreeFlattener(
      this.trainersTransformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren
    );
    this.trainersTreeControl = new FlatTreeControl<FlatNode>(
      this.getLevel,
      this.isExpandable
    );
    this.trainersDataSource = new MatTreeFlatDataSource(
      this.trainersTreeControl,
      this.trainersTreeFlattener
    );

    this.trainersDb = new Db();
    this.trainersDb.dataChange.subscribe((data) => {
      this.trainersDataSource.data = [];
      this.trainersDataSource.data = data;
    });
  }

  async ngOnInit(): Promise<void> {
    const muscles: Node[] = await this.getData("Muscles");
    this.muscleDb.dataChange.next(muscles || []);
    this.isMusclesLoaded = true;

    const props: Node[] = await this.getData("Props");
    this.propsDb.dataChange.next(props || []);
    this.isPropsLoaded = true;

    const trainers: Node[] = await this.getData("Trainers");
    this.trainersDb.dataChange.next(trainers || []);
    this.isTrainersLoaded = true;
  }

  getLevel = (node: FlatNode) => node.level;

  isExpandable = (node: FlatNode) => node.expandable;

  getChildren = (node: Node): Node[] => node.children;

  canAdd = (_: number, _nodeData: FlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: FlatNode) => _nodeData.item === "";

  isEdit = (_: number, _nodeData: FlatNode) => _nodeData.edit;

  musclesTransformer = (node: Node, level: number) => {
    const existingNode: FlatNode | undefined =
      this.musclesNestedNodeMap.get(node);
    const flatNode: FlatNode =
      existingNode && existingNode.item === node.item
        ? existingNode
        : new FlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.edit = node.edit;
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
    flatNode.edit = node.edit;
    flatNode.expandable = !!node.children?.length;
    this.propsFlatNodeMap.set(flatNode, node);
    this.propsNestedNodeMap.set(node, flatNode);

    return flatNode;
  };

  trainersTransformer = (node: Node, level: number) => {
    const existingNode: FlatNode | undefined =
      this.trainersNestedNodeMap.get(node);
    const flatNode: FlatNode =
      existingNode && existingNode.item === node.item
        ? existingNode
        : new FlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.edit = node.edit;
    flatNode.expandable = !!node.children?.length;
    this.trainersFlatNodeMap.set(flatNode, node);
    this.trainersNestedNodeMap.set(node, flatNode);

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

  addNode(flatNode: FlatNode, dbName: string): void {
    switch (dbName) {
      case "MusclesDb": {
        const node: Node | undefined = this.musclesFlatNodeMap.get(flatNode);
        this.muscleDb.insertItem(node, "");
        this.musclesTreeControl.expand(flatNode);
        break;
      }
      case "PropsDb": {
        const node: Node | undefined = this.propsFlatNodeMap.get(flatNode);
        this.propsDb.insertItem(node, "");
        this.propsTreeControl.expand(flatNode);
        break;
      }
      case "TrainersDb": {
        const node: Node | undefined = this.trainersFlatNodeMap.get(flatNode);
        this.trainersDb.insertItem(node, "");
        this.trainersTreeControl.expand(flatNode);
        break;
      }
    }
  }

  editNode(flatNode: FlatNode, dbName: string, edit: boolean): void {
    switch (dbName) {
      case "MusclesDb": {
        let parentNode: Node | undefined;
        if (flatNode.level > 0) {
          const parentFlatNode: FlatNode | null = this.getParentNode(
            flatNode,
            this.musclesTreeControl
          );
          if (parentFlatNode) {
            parentNode = this.musclesFlatNodeMap.get(parentFlatNode);
          }
        }
        const node: Node | undefined = this.musclesFlatNodeMap.get(flatNode);
        this.muscleDb.editItem(node, parentNode, edit);
        break;
      }
      case "PropsDb": {
        let parentNode: Node | undefined;
        if (flatNode.level > 0) {
          const parentFlatNode: FlatNode | null = this.getParentNode(
            flatNode,
            this.propsTreeControl
          );
          if (parentFlatNode) {
            parentNode = this.propsFlatNodeMap.get(parentFlatNode);
          }
        }
        const node: Node | undefined = this.propsFlatNodeMap.get(flatNode);
        this.propsDb.editItem(node, parentNode, edit);
        break;
      }
      case "TrainersDb": {
        let parentNode: Node | undefined;
        if (flatNode.level > 0) {
          const parentFlatNode: FlatNode | null = this.getParentNode(
            flatNode,
            this.trainersTreeControl
          );
          if (parentFlatNode) {
            parentNode = this.trainersFlatNodeMap.get(parentFlatNode);
          }
        }
        const node: Node | undefined = this.trainersFlatNodeMap.get(flatNode);
        this.trainersDb.editItem(node, parentNode, edit);
        break;
      }
    }
  }

  saveNode(flatNode: FlatNode, itemValue: string, dbName: string): void {
    switch (dbName) {
      case "MusclesDb": {
        const nestedNode: Node | undefined =
          this.musclesFlatNodeMap.get(flatNode);
        this.muscleDb.updateItem(nestedNode!, itemValue);
        break;
      }
      case "PropsDb": {
        const nestedNode: Node | undefined =
          this.propsFlatNodeMap.get(flatNode);
        this.propsDb.updateItem(nestedNode, itemValue);
        break;
      }
      case "TrainersDb": {
        const nestedNode: Node | undefined =
          this.trainersFlatNodeMap.get(flatNode);
        this.trainersDb.updateItem(nestedNode, itemValue);
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
      case "TrainersDb": {
        const parentFlatNode: FlatNode | null = this.getParentNode(
          node,
          this.trainersTreeControl
        );
        const parentNode: Node | undefined = this.trainersFlatNodeMap.get(
          parentFlatNode!
        );
        this.trainersDb.deleteItem(parentNode, node.item);
        break;
      }
    }
  }

  updateNode(flatNode: FlatNode, itemValue: string, dbName: string): void {
    switch (dbName) {
      case "MusclesDb": {
        const node: Node | undefined = this.musclesFlatNodeMap.get(flatNode);
        this.muscleDb.updateItem(node, itemValue);
        break;
      }
      case "PropsDb": {
        const node: Node | undefined = this.propsFlatNodeMap.get(flatNode);
        this.propsDb.updateItem(node, itemValue);
        break;
      }
      case "TrainersDb": {
        const node: Node | undefined = this.trainersFlatNodeMap.get(flatNode);
        this.trainersDb.updateItem(node, itemValue);
        break;
      }
    }
  }

  onNewMuscleGroupClick(): void {
    this.muscleDb.insertItem(undefined, "");
  }

  onNewPropsGroupClick(): void {
    this.propsDb.insertItem(undefined, "");
  }

  onNewTrainersGroupClick(): void {
    this.trainersDb.insertItem(undefined, "");
  }

  async onSaveClick(): Promise<void> {
    this.loadingVisible = true;

    const musclesRef: AngularFirestoreCollection =
      this.db.collection("Muscles");
    const musclesSnapshot: firebase.default.firestore.QuerySnapshot<unknown> =
      await musclesRef.get().toPromise();
    musclesSnapshot.docs.forEach(async (doc) => {
      await musclesRef.doc(doc.id).delete();
    });

    if (this.muscleDb && this.muscleDb.data.length > 0) {
      for (const muscle of this.muscleDb.data) {
        const muscleRef: AngularFirestoreDocument = musclesRef.doc(muscle.item);
        delete muscle.edit;
        muscle.children.forEach((i) => delete i.edit);
        await muscleRef.set(muscle);
      }
    }

    const propsRef: AngularFirestoreCollection = this.db.collection("Props");
    const propsSnapshot: firebase.default.firestore.QuerySnapshot<unknown> =
      await propsRef.get().toPromise();
    propsSnapshot.docs.forEach(async (doc) => {
      await propsRef.doc(doc.id).delete();
    });

    if (this.propsDb && this.propsDb.data.length > 0) {
      for (const prop of this.propsDb.data) {
        const propRef: AngularFirestoreDocument = propsRef.doc(prop.item);
        delete prop.edit;
        prop.children.forEach((i) => delete i.edit);
        await propRef.set(prop);
      }
    }

    const trainersRef: AngularFirestoreCollection =
      this.db.collection("Trainers");
    const trainersSnapshot: firebase.default.firestore.QuerySnapshot<unknown> =
      await trainersRef.get().toPromise();
    trainersSnapshot.docs.forEach(async (doc) => {
      await trainersRef.doc(doc.id).delete();
    });

    if (this.trainersDb && this.trainersDb.data.length > 0) {
      for (const trainer of this.trainersDb.data) {
        const trainerRef: AngularFirestoreDocument = trainersRef.doc(
          trainer.item
        );
        delete trainer.edit;
        trainer.children.forEach((i) => delete i.edit);
        await trainerRef.set(trainer);
      }
    }

    this.loadingVisible = false;
  }
}
