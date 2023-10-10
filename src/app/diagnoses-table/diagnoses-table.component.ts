import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators}  from "@angular/forms";
import { DictionaryService } from "../services/dictionary.service";
import { Diagnosis, DynamicControl, FormData, JsonObject } from "../interfaces/diagnosis";
import { NgSelectComponent } from "@ng-select/ng-select";
import { UUID } from "angular2-uuid";

@Component({
  selector: 'app-diagnoses-table',
  templateUrl: './diagnoses-table.component.html',
  styleUrls: ['./diagnoses-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiagnosesTableComponent implements OnInit {
  @ViewChild('diagnosisSelect')
  public diagnosisSelect: NgSelectComponent | any;
  public diagnoses: Diagnosis[] = [];
  public selectOptions: string[] = [];
  public diagnosesForm: FormGroup;
  public generatedJson: Object = new Object({} as JsonObject);
  private dictionaries: any[] = [];

  constructor(
    private dictionaryService: DictionaryService,
  ) {
    this.diagnosesForm = new FormGroup({
      date: new FormControl<Date | null>(null, [Validators.required, this.dateValidator]),
      dynamicControls: new FormArray([
        new FormGroup({
          selectControl: new FormControl<string | null>(null),
          textControl: new FormControl<string | null>(null),
        }),
      ]),
    });
  }

  public ngOnInit(): void {
    this.getDictionary();
  }

  public onSubmit(): void {
    const formData = this.diagnosesForm.getRawValue();

    this.generatedJson = this.generateObject(formData);
  }

  public addDynamicControl(): void {
    const dynamicControlGroup = new FormGroup({
      selectControl: new FormControl<string>(''),
      textControl: new FormControl<string>(''),
    });

    const selectControl = new FormControl<string>('');
    dynamicControlGroup.addControl('selectControl', selectControl);

    this.dynamicControls.push(dynamicControlGroup);
  }

  public removeDynamicControl(index: number): void {
    this.dynamicControls.removeAt(index);
  }

  get dynamicControls() {
    return this.diagnosesForm?.get('dynamicControls') as FormArray;
  }

  private getDictionary(): void {
    this.dictionaryService.getDictionary()
      .subscribe((data) => {
        this.dictionaries = data;
        this.getDiagnosesForSelect();
      })
  }

  private getDiagnosesForSelect(): void {
    this.diagnoses = this.dictionaries.map((item: any) =>
      ({
        id: item.id,
        code: item.code,
        name: item.name
      })
    );
    this.diagnoses.forEach(diagnosis => {
      this.selectOptions.push(`${diagnosis.code} ${diagnosis.name}`)
    });
  }

  private dateValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (control?.value) {
      const today: Date = new Date();
      const yesterday: Date = new Date(today.setDate(today.getDate() - 1));
      const dateToCheck: Date = new Date(control.value);
      if (dateToCheck <= yesterday) {
        return {'Invalid date': true}
      }
    }
    return null;
  }

  public onSearchDiagnosis(searchText: string, event: Event): void {
    event.preventDefault();
    this.diagnosisSelect.filter(searchText);
  }

  private generateObject(formData: FormData): JsonObject {
    return {
      encounter: {
        date: (new Date(formData.date)).toISOString(),
      },
      conditions: formData.dynamicControls.length > 1 ? this.generateConditions(formData.dynamicControls) : '',
    }
  }

  private generateConditions(dynamicControls: DynamicControl[]) {
    return dynamicControls.map((dynamicControl: DynamicControl) => {
      return {
        id: UUID.UUID(),
        context: {
          identifier: {
            type: {
              coding: [
                {
                  system: dynamicControl.selectControl.name,
                  code: dynamicControl.selectControl.code
                }
              ]
            },
            value: dynamicControl.selectControl.id
          }
        },
        code: {
          coding: [
            {
              system: dynamicControl.selectControl.name,
              code: dynamicControl.selectControl.code
            }
          ]
        },
        notes: dynamicControl.textControl || '',
        onset_date: (new Date()).toISOString(),
      }
    })
  }
}
