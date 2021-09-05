import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
} from "@angular/fire/firestore";

@Injectable({
  providedIn: "root",
})
export class DbService {
  constructor(private db: AngularFirestore) {}

  async getCollection(
    collection: string
  ): Promise<firebase.default.firestore.QuerySnapshot<unknown>> {
    const snaps: firebase.default.firestore.QuerySnapshot<unknown> =
      await this.db.collection(collection).get().toPromise();

    return snaps;
  }

  async getCollectionDocuments(collection: string): Promise<any[]> {
    const snaps: firebase.default.firestore.QuerySnapshot<unknown> =
      await this.getCollection(collection);

    const documents: any[] = snaps.docs.map((snap) => {
      const snapData: Object = snap.data() as Object;

      return {
        id: snap.id,
        ...snapData,
      };
    });

    return documents;
  }

  async saveCollection(collection: string, documents: any[]): Promise<void> {
    const collectionRef: AngularFirestoreCollection =
      this.db.collection(collection);
    const collectionSnapshot: firebase.default.firestore.QuerySnapshot<unknown> =
      await collectionRef.get().toPromise();
    collectionSnapshot.docs.forEach(async (doc) => {
      await collectionRef.doc(doc.id).delete();
    });

    if (documents && documents.length > 0) {
      for (const document of documents) {
        const documentRef: AngularFirestoreDocument = collectionRef.doc(
          document.uuid
        );
        await documentRef.set(document);
      }
    }
  }
}
