import { IElement } from "../Element";
import { IXsdDiagnostic, IXsdType, XsdDiagnosticCode } from "./Xsd";
export class XsdDiagnostic implements IXsdDiagnostic {
    constructor(public readonly errorCode: XsdDiagnosticCode, public readonly message: string, public readonly element: IElement, public readonly type: IXsdType) {
    }
}