import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactsService } from '../contacts/contacts.service';
import { phoneTypeValues, addressTypeValues } from '../contacts/contact.model';
import { restrictedWords } from '../Validators/restricted-words.validator';
import { concat, distinctUntilChanged } from 'rxjs';

@Component({
  templateUrl: './edit-contact.component.html',
  styleUrls: ['./edit-contact.component.css']
})
export class EditContactComponent implements OnInit {
  phoneTypes =phoneTypeValues;
  addressTypes =addressTypeValues;
  contactForm = this.fb.nonNullable.group({
    id: '',
    icon: '',
    personal: false,
    firstName: ['', [Validators.required, Validators.minLength(3)]],
    lastName: '',
    dateOfBirth: <Date | null>null,
    favoritesRanking: <number | null>null,
    phones: this.fb.array([this.createPhoneGroup()]),
    address: this.fb.nonNullable.group({
      streetAddress: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      addressType: '',
    }),
    notes:['', restrictedWords(['foo','bar'])],
  });

  constructor(
    private route: ActivatedRoute,
    private contactsService: ContactsService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    const contactId = this.route.snapshot.params['id'];
    if (!contactId) return;

    this.contactsService.getContact(contactId).subscribe((contact) => {
      if (!contact) return;
      for(let i =1; i < concat.phone.length; i++){
        this.addPhone();
      }

      this.contactForm.setValue(contact);
    });
  }
  stringifyCompare(a:any, b :any ){
    return JSON.stringify(a) === JSON.stringify(b);
  }
  createPhoneGroup() {
    const phoneGroup = this.fb.nonNullable.group({
     phoneType:'',
     phoneNumeber:'',
     preferred: false,
  });
  phoneGroup.controls.preferred.valueChanges
  .pipe(distinctUntilChanged((a,b ) => JSON.stringify(a) === JSON.stringify(b)))
  .subscribe(value =>{
    if (value)
      phoneGroup.controls.phoneNumeber.addAsyncValidators({Validators.required]);
    else
    phoneGroup.controls.phoneNumeber.removeValidators({Validators.required]);
  phoneGroup.controls.phoneNumeber.updateValueAndValidity();

  });

  return phoneGroup;
}
addPhone(){
  this.contactForm.controls.phones.push(this.createPhoneGroup());
}
    get firstName(){
    return this.contactForm.controls.firstName;
  }
  get notes(){
    return this.contactForm.controls.notes;
  }
  saveContact() {
    console.log(this.contactForm.value.favoritesRanking, typeof this.contactForm.value.favoritesRanking);
    this.contactsService.saveContact(this.contactForm.getRawValue()).subscribe({
      next: () => this.router.navigate(['/contacts'])
    });
  }
}

