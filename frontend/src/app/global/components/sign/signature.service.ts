import { Injectable } from "@angular/core";
import { HttpService } from "../../services/http.service";
import { BehaviorSubject, finalize, map, Observable, tap } from "rxjs";
import { Size } from "../../utils/img.util";
import { Status } from "../../status";
import { CourtineService } from "../../nav/courtine.service";

export type SignatureStatus = Status.DRAFT | Status.READY


export interface Signature {
    id: string
    uid: string
    status: SignatureStatus
    created: Date
    modified?: Date
    base64data: string
    size: Size
}

export interface PutSignatureDto {
    base64data: string
    size: Size
    id?: string
}

@Injectable({
    providedIn: 'root'
})
export class SignatureService {
  
    constructor(
      private readonly http: HttpService,
    ) { }


    showSection$ = new BehaviorSubject(false)

    public showSection() {
        this.showSection$.next(true)
    }
    public closeSection() {
        this.showSection$.next(false)
    }

    listSignatures$(): Observable<Signature[]> {
        return this.http.get<Signature[]>(`/document/signatures`).pipe(
            map(s => this.sortSignatures(s)),
        )
    }

    private sortSignatures = (signatures: Signature[]): Signature[] => {
        return signatures.sort((b, a) => new Date(a.modified || a.created).getTime() - new Date(b.modified || b.created).getTime())
    }

    putSignature$(dto: PutSignatureDto): Observable<{ id: string }> {
        return this.http.put<{ id: string }>(`/document/signature`, dto)
    }

    cancelSignature$(id: string): Observable<void> {
        return this.http.delete<void>(`/document/signature/${id}`)
    }

}