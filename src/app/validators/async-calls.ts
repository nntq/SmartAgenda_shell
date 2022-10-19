import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function gte(val: any): ValidatorFn {

 return (control: AbstractControl): ValidationErrors | null => {

    return {gte: true};
 }
       
}
