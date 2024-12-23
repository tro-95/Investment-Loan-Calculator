// Investment calculator - Net Present Value, Internal rate of return, balance indicators
class ICalc{
  constructor(cap, dc, tp, ir, ai, am){
    this.starting_capital = cap;
    this.debt_capital = dc;
    this.time_period = tp;
    this.interest_rate = ir;
    this.attended_income = ai;
    this.amortization_rate = am;

    this.periodical_fc = Math.round((ir / 100) * dc);
    this.minimum_income = Math.round((cap / tp) + this.periodical_fc);
    this.attended_income_fc = ai - this.periodical_fc;
    this.total_fc = Math.round(-(this.periodical_fc * tp));
    this.payback_period = Math.round(cap / this.attended_income_fc);

    this.equity_capital = cap - dc;
    this.amortized_capital = cap - (am / 100) * cap;
    this.total_amortization = (am / 100) * cap;

    this.ebitda = ai * tp;
    this.ebit = ai * tp - (cap - this.amortized_capital);
    this.total_ocf = this.ebitda + this.total_fc;
    this.ebt = this.ebit + this.total_fc;
    this.balance = this.ebt - cap;
    this.to_repay = this.total_ocf - cap;
  }

  // ROI Calc
  ROI_Calc(){
    let r = [(this.ebit / this.time_period) / this.starting_capital] * 100;
    r = Math.round((r + Number.EPSILON) * 100) / 100;
    return r;
  }

  // ROE Calc
  ROE_Calc(){
    let r = [(this.ebt / this.time_period) / this.equity_capital] * 100;
    r = Math.round((r + Number.EPSILON) * 100) / 100;
    return r;
  }

  // Total ROI Calc
  TROI_Calc(){
    let r = (this.to_repay / this.starting_capital) * 100;
    r = Math.round((r + Number.EPSILON) * 100) / 100;
    return r;
  }

  // Debt-to-Investment Calc
  DTI_Calc(){
    let r = this.debt_capital / this.starting_capital;
    r = Math.round((r + Number.EPSILON) * 100) / 100;
    return r;
  }

  // Leverage Ratio Calc
  LR_Calc(){
    let r = this.debt_capital / this.equity_capital;
    r = Math.round((r + Number.EPSILON) * 100) / 100;
    return r;
  }

  // Average IR Calc
  AIR_Calc(cc = this.interest_rate){
    let r = cc * this.DTI_Calc();
    r = Math.round((r + Number.EPSILON) * 100) / 100;
    return r;
  }

  // NPV Calc
  NPV_Calc(cc = this.interest_rate){
    let rcc = this.AIR_Calc();
    let x = this.attended_income_fc;
    if(cc !== this.interest_rate){
      rcc = this.AIR_Calc(cc);
      x = this.attended_income - (cc / 100) * this.debt_capital;
    }
    let y = -(this.starting_capital);
    let r = Array();
    for(let i = 0; i < this.time_period; i++){
      let f = [1 + (rcc / 100)] ** (i + 1);
      r[i] = Math.round((x * (1 / f) + Number.EPSILON) * 100) / 100;
      y += x * (1 / f);
    }
    y = Math.round((y + Number.EPSILON) * 100) / 100;
    r.push(y);
    return r;
  }

  // https://ourcodeworld.com/articles/read/1470/how-to-find-the-closest-value-to-zero-from-an-array-with-positive-and-negative-numbers-in-javascript
  closestToZero(numbers){
    if(!numbers.length){
        return 0;
    }
    let closest = 0;
    for (let i = 0; i < numbers.length ; i++) {
        if (closest === 0) {
            closest = numbers[i];
        } else if (numbers[i] > 0 && numbers[i] <= Math.abs(closest)) {
            closest = numbers[i];
        } else if (numbers[i] < 0 && - numbers[i] < Math.abs(closest)) {
            closest = numbers[i];
        }
    }
    return closest;
}

  // IRR Calc
  IRR_Calc(cc = this.interest_rate){
    let c = this.NPV_Calc();
    let v = c.pop();
    let s = v;
    let m = (v > 0) ? (0.3) : (-0.3);
    let p = 0;
    let n = 0;
    let a = Array();
    let b = Array();
    if(v > 0){
      p = Number(cc);
      while (s > 0){
        cc = Number(cc) + m;
        c = this.NPV_Calc(cc);
        console.log(cc);
        console.log(c);
        s = c.pop();
        a.push(s);
        b[s] = cc;
      }
      n = cc;
    }
    else{
      n = Number(cc);
      while(s < 0){
        cc = Number(cc) + m;
        c = this.NPV_Calc(cc);
        console.log(cc);
        console.log(c);
        s = c.pop();
        a.push(s);
        b[s] = cc;
      }
      p = cc;
    }
    let cl = this.closestToZero(a);
    cc = Number(b[cl]);
    m = (cl > 0) ? (0.1) : (-0.1);
    let last = 0;
    let first = 0;
    let rcc = Array();
    if(cl > 0){
      while(cl > 0){
        last = Number(cc);
        cc = Number(cc) + m;
        cl = this.NPV_Calc(cc).pop();
        console.log(cc);
        console.log(cl);
      }
      first = Number(cc);
    }
    else{
      while(cl < 0){
        last = Number(cc);
        cc = Number(cc) + m;
        cl = this.NPV_Calc(cc).pop();
        console.log(cc);
        console.log(cl);
      }
      first = Number(cc);
    }
    rcc[0] = Math.round((first + Number.EPSILON) * 100) / 100;
    rcc[1] = this.NPV_Calc(first).pop();
    rcc[2] = Math.round((last + Number.EPSILON) * 100) / 100;
    rcc[3] = this.NPV_Calc(last).pop();
    return rcc;
  }

}

// Loan calculator - repayment, total interest costs, net & average interest
class LCalc{
  constructor(am, ir, ap, ny, fc, ii){
    this.loan_amount = am;
    this.interest_rate = ir;
    this.annual_payments = ap;
    this.numberof_years = ny;
    //this.annual_compounding = ac;
    this.financial_costs = Number(fc);
    this.inflation = ii;

    this.numberof_payments = ap * ny;
    this.payment_amount = am / (ap * ny);
  }

  // Interest value Calc
  IV_Calc(a, ir){
    let r = (ir / 100) * a;
    r = Math.round((r + Number.EPSILON) * 100) / 100;
    return r;
  }

  // Interest rate calc
  IR_Calc(){
    let amount = this.loan_amount;
    let payments = this.numberof_payments;
    let total_interest = 0;
    let h = 0;
    let l = 0;
    let compounded_int = this.interest_rate / this.annual_payments;
    let r = {};
    if(payments === 0){ payments = 1; compounded_int = this.interest_rate * this.numberof_years; }
    for(let i = 0; i < payments; i++){
      let v = this.IV_Calc(amount, compounded_int);
      if(i === 0) { h = v; }
      if(i === (payments - 1)) { l = v; }
      total_interest += v;
      amount -= this.payment_amount;
    }
    let control_value = h * payments;
    let net_value = control_value + Number(this.financial_costs);
    let real_net_value = total_interest + Number(this.financial_costs);
    let amortized_value = (this.AM_Calc(compounded_int) * this.numberof_payments) - this.loan_amount;
    let amortized_net_value = amortized_value + Number(this.financial_costs);

    let control_int = [(control_value / this.numberof_years) / this.loan_amount] * 100;
    let net_int = [(net_value / this.numberof_years) / this.loan_amount] * 100;
    let real_amortized_int = [((amortized_value * 2) / this.numberof_years) / this.loan_amount] * 100;
    let real_amortized_net_int = [((amortized_value * 2 + Number(this.financial_costs)) / this.numberof_years) / this.loan_amount] * 100;

    let average_int = [(total_interest / this.numberof_years) / this.loan_amount] * 100;
    let average_net_int = [(real_net_value / this.numberof_years) / this.loan_amount] * 100;
    let average_amortized_int = [(amortized_value / this.numberof_years) / this.loan_amount] * 100;
    let average_amortized_net_int = [(amortized_net_value / this.numberof_years) / this.loan_amount] * 100;

    let compounded_net_int = net_int / this.annual_payments;
    let compounded_amortized_int = real_amortized_int / this.annual_payments;
    let compounded_amortized_net_int = real_amortized_net_int / this.annual_payments;

    let average_int_payment = (h + l) / 2;
    let average_payment = average_int_payment + this.payment_amount;
    r["interest_amount"] = Math.round((total_interest + Number.EPSILON) * 10) / 10;
    r["net_interest_amount"] = Math.round((net_value + Number.EPSILON) * 10) / 10;
    r["amortized_interest_amount"] = Math.round((amortized_value + Number.EPSILON) * 10) / 10;
    r["amortized_net_interest_amount"] = Math.round((amortized_net_value + Number.EPSILON) * 10) / 10;
    r["amortized_payment_amount"] = Math.round((this.AM_Calc(compounded_int) + Number.EPSILON) * 10) / 10;
    r["average_interest_amount"] = Math.round((average_int_payment + Number.EPSILON) * 10) / 10;
    r["average_payment_amount"] = Math.round((average_payment + Number.EPSILON) * 10) / 10;

    r["control_interest_rate"] = Math.round((control_int + Number.EPSILON) * 100) / 100;
    r["net_interest_rate"] = Math.round((net_int + Number.EPSILON) * 100) / 100;
    r["amortized_real_interest_rate"] = Math.round((real_amortized_int + Number.EPSILON) * 100) / 100;
    r["amortized_net_interest_rate"] = Math.round((real_amortized_net_int + Number.EPSILON) * 100) / 100;

    r["compounded_interest_rate"] = Math.round((compounded_int + Number.EPSILON) * 100) / 100;
    r["compounded_net_interest_rate"] = Math.round((compounded_net_int + Number.EPSILON) * 100) / 100;
    r["compounded_amortized_interest_rate"] = Math.round((compounded_amortized_int + Number.EPSILON) * 100) / 100;
    r["compounded_amortized_net_interest_rate"] = Math.round((compounded_amortized_net_int + Number.EPSILON) * 100) / 100;

    r["average_interest_rate"] = Math.round((average_int + Number.EPSILON) * 100) / 100;
    r["average_net_interest_rate"] = Math.round((average_net_int + Number.EPSILON) * 100) / 100;

    r["highest_interest"] = Math.round((h + Number.EPSILON) * 10) / 10;
    r["lowest_interest"] = Math.round((l + Number.EPSILON) * 10) / 10;
    r["highest_payment"] = Math.round(((h + this.payment_amount) + Number.EPSILON) * 10) / 10;
    r["lowest_payment"] = Math.round(((l + this.payment_amount) + Number.EPSILON) * 10) / 10;

    r["net_interest_rate_adjusted"] = Math.round(((net_int - this.inflation) + Number.EPSILON) * 100) / 100;
    r["average_interest_rate_adjusted"] = Math.round(((average_int - this.inflation) + Number.EPSILON) * 100) / 100;
    r["average_net_interest_rate_adjusted"] = Math.round(((average_net_int - this.inflation) + Number.EPSILON) * 100) / 100;
    r["amortized_net_interest_rate_adjusted"] = Math.round(((real_amortized_net_int - this.inflation) + Number.EPSILON) * 100) / 100;
    console.log(r["control_interest_rate"]);
    return r;
  }

  // Total repayment Calc
  TR_Calc(fc){
    let tr = fc + Number(this.loan_amount);
    let r = Array();
    let loan_prc = (this.loan_amount / tr) * 100;
    let fc_prc = (fc / tr) * 100;
    r[0] = tr;
    r[1] = Math.round((loan_prc + Number.EPSILON) * 100) / 100;
    r[2] = Math.round((fc_prc + Number.EPSILON) * 100) / 100;
    return r;
  }

  // Amortized payment Calc
  AM_Calc(comp){
    let compounded_nrate = comp / 100;
    let n = compounded_nrate * ((1 + compounded_nrate) ** this.numberof_payments);
    let d = ((1 + compounded_nrate) ** this.numberof_payments) - 1;
    let r = this.loan_amount * (n / d);
    r = Math.round((r + Number.EPSILON) * 10) / 10;
    return r;
  }


}
