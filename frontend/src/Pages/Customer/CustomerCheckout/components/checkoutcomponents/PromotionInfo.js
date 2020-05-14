import React, { Component } from 'react';
import { Grid } from "@material-ui/core";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import Radio from "@material-ui/core/Radio";
import { orderService } from "../../../../../services"

class PromotionInfo extends Component {
    state = {  
        promotionid: this.props.promotionid,
        label: "",
        checked: "",
    }
    
    componentDidMount() {
        orderService.promotionApplied.subscribe((x) => {
            this.setState({ checked: x });
            console.log('wot',this.state.promotionid)
        }
    );
        orderService.promotionDetails(this.state.promotionid).then((response) => {
            response.json().then((data) => {
                let label = ""
                if (data.freedelivery) {
                    label = data.percentageoff + "% off total with free delivery"
                } else {
                    label = data.percentageoff + "% off total"
                }
                this.setState({ label })
            })
        })
    }

    handleChange = (event) => {
        console.log(event.target.value)
        orderService.setAppliedPromotion(event.target.value);
        console.log('promotion: ', orderService.promotionAppliedValue);
    }

    render() { 
        return ( 
            <div> 
            <Radio
                checked={this.state.checked === this.state.promotionid.toString()}
                  value={this.state.promotionid.toString()}
                  onChange={(e) => this.handleChange(e)}
                />
                {this.state.label}
                </div>
        );
    }
}
 
export default PromotionInfo;