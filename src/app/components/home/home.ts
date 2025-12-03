import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-home',
    imports: [],
    template: `
        <div>
            <h2>GitHub Auth Callback</h2>
            <p>Code: {{ token }}</p>
        </div>

    `
})
export class Home implements OnInit {
    title = "Skemmarize";
    token: string = "";

    constructor(private route: ActivatedRoute, private router: Router) { }

    ngOnInit(): void {
        this.token = this.route.snapshot.queryParamMap.get("code")!;
        
        console.log("token: ",this.token);
        console.log(this.route.snapshot)
    }
}
