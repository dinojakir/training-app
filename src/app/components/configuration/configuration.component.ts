import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Injectable, OnInit } from '@angular/core';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';

export class MuscleNode {
  children: MuscleNode[] = [];
  item: string = '';
}

export class MuscleFlatNode {
  item: string = '';
  level: number = 0;
  expandable: boolean = false;
}

const TREE_DATA = {
  Muscles: {
    Neck: {
      Apple: null,
      Berries: null,
      Orange: null,
    },
    UpperArms: {
      Apple: null,
      Berries: null,
      Orange: null,
    },
  },
};

@Injectable()
export class MuscleDb {
  dataChange = new BehaviorSubject<MuscleNode[]>([]);

  get data(): MuscleNode[] {
    return this.dataChange.value;
  }

  constructor() {
    this.initialize();
  }

  initialize() {
    const data = this.buildFileTree(TREE_DATA, 0);

    this.dataChange.next(data);
  }

  buildFileTree(obj: { [key: string]: any }, level: number): MuscleNode[] {
    return Object.keys(obj).reduce<MuscleNode[]>((accumulator, key) => {
      const value = obj[key];
      const node = new MuscleNode();
      node.item = key;

      if (value != null) {
        if (typeof value === 'object') {
          node.children = this.buildFileTree(value, level + 1);
        } else {
          node.item = value;
        }
      }

      return accumulator.concat(node);
    }, []);
  }

  deleteItem(parent: MuscleNode, name: string) {
    if (parent.children) {
      parent.children = parent.children.filter((j) => j.item !== name);
      this.dataChange.next(this.data);
    }
  }

  insertItem(parent: MuscleNode, name: string) {
    if (parent.children) {
      parent.children.push({ item: name } as MuscleNode);
      this.dataChange.next(this.data);
    }
  }

  updateItem(node: MuscleNode, name: string) {
    node.item = name;
    this.dataChange.next(this.data);
  }
}

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss'],
  providers: [MuscleDb],
})
export class ConfigurationComponent implements OnInit {
  flatNodeMap = new Map<MuscleFlatNode, MuscleNode>();
  nestedNodeMap = new Map<MuscleNode, MuscleFlatNode>();
  newItemName = '';
  treeControl: FlatTreeControl<MuscleFlatNode>;
  treeFlattener: MatTreeFlattener<MuscleNode, MuscleFlatNode>;
  dataSource: MatTreeFlatDataSource<MuscleNode, MuscleFlatNode>;

  constructor(private _database: MuscleDb) {
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

    _database.dataChange.subscribe((data) => {
      this.dataSource.data = data;
    });
  }

  ngOnInit() {
    this.treeControl.expand(this.transformer(this.dataSource.data[0], 0));
  }

  getLevel = (node: MuscleFlatNode) => node.level;

  isExpandable = (node: MuscleFlatNode) => node.expandable;

  getChildren = (node: MuscleNode): MuscleNode[] => node.children;

  hasChild = (_: number, _nodeData: MuscleFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: MuscleFlatNode) =>
    _nodeData.item === '';

  transformer = (node: MuscleNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode =
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

  getParentNode(node: MuscleFlatNode): MuscleFlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  addNewItem(node: MuscleFlatNode) {
    const parentNode = this.flatNodeMap.get(node);
    this._database.insertItem(parentNode!, '');
    this.treeControl.expand(node);
  }

  saveNode(node: MuscleFlatNode, itemValue: string) {
    const nestedNode = this.flatNodeMap.get(node);
    this._database.updateItem(nestedNode!, itemValue);
  }

  deleteNode(node: MuscleFlatNode) {
    const parentFlatNode = this.getParentNode(node);
    const parentNode = this.flatNodeMap.get(parentFlatNode!);
    this._database.deleteItem(parentNode!, node.item);
  }

  onSaveClick() {}
}
