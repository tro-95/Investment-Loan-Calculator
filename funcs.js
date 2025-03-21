// Functions:

function change_form(title, text, id, small, func, bgcolor, btcolor, tcolor, sh){
  let p = '<form name="calc">' + "\n";
  for(i = 0; i < text.length; i++){
    let ctrl = (text[i].match(/%/g) !== null) ? 'oninput="rate(this)"' : 'oninput="separator(this)"';
    let ltext = text[i].replace(/%/g, '');
    let html = ltext + '<input id="' + id[i] + '" type="text" '+ ctrl +' /> <br> <small>' + small[i] + '</small>';
    p += '<p>' + html + '</p>' + "\n";
  }
  let button_style = 'background-color: ' + btcolor + '; ' + 'color: ' + tcolor + ';';
  p += '<p><input value="Calculate" style="' + button_style + '" onclick="' + func +'()" type="button" /> </p>' + "\n";
  p += '</form>' + "\n";
  document.title = title;
  document.getElementById("title").innerHTML = '<h3> ' + title + ' </h3>';
  document.body.style.backgroundColor = bgcolor;
  document.body.style.color = tcolor;
  document.getElementById("form").innerHTML = p;
  document.getElementById("switch").style.color = sh;
  document.body.style.transition = 'background-color 0.6s ease';
  document.getElementById("result").innerHTML = '';
}

function create_result(id, content){
  let container = document.getElementById("result");
  let output = document.createElement('div');
  output.setAttribute('id', id);
  container.appendChild(output);
  document.getElementById(id).innerHTML = content;
}

function create_table(r1, r2){
  //smaller tables with more columns
  let w = 80;
  let table = '<table>';
  for(i = 0; i < r1.length; i++){
    table += '<tr>';
    table += '<td width="' + w + '%">' + r1[i] + '</td>';
    table += '<td>' + r2[i] + '</td>';
    table += '</tr>';
  }
  table += '</table>';
  return table;
}

function collapse(id){
  let c = document.getElementById(id);
  let a = document.getElementById("collapsible");
  a.addEventListener("click", function() {
    if (c.style.display === "block") {
      c.style.display = "none";
      a.innerHTML="[View more]";
    } else {
      c.style.display = "block";
      a.innerHTML="[View less]";
    }
  });
}

// https://stackoverflow.com/questions/63384445/thousands-separator-with-javascript
function separator(input){
  let nums = input.value.replace(/\.|,/g, '');
  if (!nums || nums.endsWith('.')) return;
  input.value = parseInt(nums).toLocaleString("de-DE");
}

function rate(input){
  let nums = input.value.replace(/%/g, '');
  if (!nums || nums.endsWith('.')) return;
  input.value = nums + '%';
}

function investment_calc(){
  const starting_capital = parseInt(document.getElementById('starting_capital').value.replace(/\D/g,''));
  const debt_capital = parseInt(document.getElementById('debt_capital').value.replace(/\D/g,''));
  const time_period = parseInt(document.getElementById('time_period').value.replace(/\D/g,''));
  const cost_of_capital = parseFloat(document.getElementById('cost_of_capital').value.replace(/%/g,''));
  const attended_income = parseInt(document.getElementById('attended_income').value.replace(/\D/g,''));
  const amortization_rate = parseFloat(document.getElementById('amortization_rate').value.replace(/%/g,''));

  let EC = new ICalc(starting_capital, debt_capital, time_period, cost_of_capital, attended_income, amortization_rate);

  let npv_calc = EC.NPV_Calc();
  let npv = npv_calc.slice(-1).pop();
  npv_calc.pop();
  let npv_periods = '';
  for(i = 0; i < npv_calc.length; i++){
    npv_periods += "P" + (i + 1).toString() + ": " + npv_calc[i].toString() + "; ";
  }
  let irr_calc = EC.IRR_Calc();
  let irr_str = irr_calc[0] + "% [" + irr_calc[1] + "] -- " + irr_calc[2] + "% [" + irr_calc[3] + "]";

  let a1 = Array("Periodical Return On Investment",
  "Periodical Return On Equity",
  "Total Return On Investment",
  "Leverage Ratio");
  let a2 = Array(EC.ROI_Calc() + "%",
  EC.ROE_Calc() + "%",
  EC.TROI_Calc() + "%",
  EC.LR_Calc());

  let r1 = Array("Investment cost",
  "Earnings Before Interest Taxes Depreciation and Amortization (EBITDA)",
  "Amortization",
  "Earnings Before Interest and Taxes (EBIT)",
  "Financial costs",
  "Operating Cash Flow (OCF)",
  "Earnings Before Taxes (EBT)",
  "Final economic profit/loss");
  let r2 = Array(EC.starting_capital,
  EC.ebitda,
  EC.total_amortization,
  EC.ebit,
  EC.total_fc,
  EC.total_ocf,
  EC.ebt,
  EC.balance);

  let c1 = Array("Starting capital",
  "Equity capital",
  "Debt capital",
  "Debt-to-investment ratio",
  "Interest rate for total capital",
  "Starting capital amortized",
  "Total amortization",
  "Minimum income",
  "Attended income",
  "Periodical financial costs",
  "Attended income, with financial costs",
  "Total cash flow from operations",
  "Final balance (assets) = Amortized investment + OCF - Debt repayment",
  "Final balance (liabilities) = Initial equity +/- Profit / Loss EBT",
  "Final repayment value");
  let c2 = Array(EC.starting_capital,
  EC.equity_capital,
  EC.debt_capital,
  EC.DTI_Calc(),
  EC.AIR_Calc() + "%",
  EC.amortized_capital,
  EC.total_amortization,
  EC.minimum_income,
  EC.attended_income,
  EC.periodical_fc,
  EC.attended_income_fc,
  EC.total_ocf,
  (EC.amortized_capital + EC.total_ocf - EC.debt_capital),
  (EC.equity_capital + EC.ebt),
  EC.to_repay);

  let tbl1 = create_table(a1, a2);
  let tbl2 = create_table(r1, r2);
  let tbl3 = create_table(c1, c2);
  let coll = '  <a id="collapsible" href="#" onclick="collapse(\'npv_periods\'); return false;">[View more]</a>';

  create_result("pp", "Payback period: " + EC.payback_period);
  create_result("npv", "Net Present Value (NPV): " + npv + coll);
  create_result("npv_periods", npv_periods);
  create_result("irr", "Internal Rate of Return (IRR): " + irr_str);
  create_result("d1", "<br><br>");

  create_result("inv", tbl1);
  create_result("d2", "<br><br>");
  create_result("rep", tbl2);
  create_result("d3", "<br><br>");
  create_result("ret", tbl3);
  create_result("d4", "<br><br>");

}


function loan_calc(){
  const loan_amount = parseInt(document.getElementById('loan_value').value.replace(/\D/g,''));
  const interest = parseFloat(document.getElementById('interest_rate').value.replace(/%/g,''));
  const payments = parseInt(document.getElementById('n_payments').value.replace(/\D/g,''));
  const years = parseInt(document.getElementById('n_years').value.replace(/\D/g,''));
  const additional_fc = parseInt(document.getElementById('additional').value.replace(/\D/g,''));
  const inflation = parseFloat(document.getElementById('inflation_rate').value.replace(/%/g,''));

  let EC = new LCalc(loan_amount, interest, payments, years, additional_fc, inflation);

  let total_int_value = EC.IR_Calc();
  let total_int_value_fc = total_int_value["interest_amount"] + EC.financial_costs;
  let total_repayment = EC.TR_Calc(total_int_value["interest_amount"]);
  let total_repayment_fc = EC.TR_Calc(total_int_value_fc);
  let total_amortized_repayment = EC.TR_Calc(total_int_value["amortized_interest_amount"]);
  let total_amortized_repayment_fc = EC.TR_Calc(total_int_value["amortized_net_interest_amount"]);
  let av_int = (total_int_value["highest_interest"] + total_int_value["lowest_interest"]) / 2;
  let av_payment = Math.round(EC.payment_amount) + av_int;

  let i1 = Array("Total interest costs",
  "- With additional financial costs",
  "Net interest rate",
  "- Adjusted for inflation",
  "Average annual interest rate",
  "- Adjusted for inflation",
  "Average annual net interest rate",
  "- Adjusted for inflation");
  let i2 = Array(total_int_value["interest_amount"],
  total_int_value_fc,
  total_int_value["net_interest_rate"] + "%",
  total_int_value["net_interest_rate_adjusted"] + "%",
  total_int_value["average_interest_rate"] + "%",
  total_int_value["average_interest_rate_adjusted"] + "%",
  total_int_value["average_net_interest_rate"] + "%",
  total_int_value["average_net_interest_rate_adjusted"] + "%");

  let g1 = Array("Amortized interest rate",
    "Amortized net interest rate",
    "- Adjusted for inflation",
    "Average annual amortized interest rate",
    "- Adjusted for inflation",
    "Average annual amortized net interest rate",
    "- Adjusted for inflation",
    "Compounded amortized interest per payment",
    "- With additional financial costs",
    "Based on total amortized interests",
    "- With additional financial costs");
  let g2 = Array(total_int_value["amortized_real_interest_rate"] + "%",
    total_int_value["amortized_net_interest_rate"] + "%",
    total_int_value["amortized_net_interest_rate_adjusted"] + "%",
    total_int_value["average_amortized_interest_rate"]  + "%",
    total_int_value["average_amortized_interest_rate_adjusted"]  + "%",
    total_int_value["average_amortized_net_interest_rate"]  + "%",
    total_int_value["average_amortized_net_interest_rate_adjusted"]  + "%",
    total_int_value["compounded_amortized_interest_rate"] + "%",
    total_int_value["compounded_amortized_net_interest_rate"] + "%",
    total_int_value["amortized_interest_amount"],
    total_int_value["amortized_net_interest_amount"]);

  let c1 = Array("Compounded interest per payment",
  "- With additional financial costs",
  "Highest interests",
  "- Payment amount",
  "Lowest interests",
  "- Payment amount",
  "Payment amount w/o interests");
  let c2 = Array(total_int_value["compounded_interest_rate"] + "%",
  total_int_value["compounded_net_interest_rate"] + "%",
  total_int_value["highest_interest"],
  total_int_value["highest_payment"],
  total_int_value["lowest_interest"],
  total_int_value["lowest_payment"],
  Math.round(EC.payment_amount));

  let a1 = Array("Total repayment amount",
  "- Of which principal amount",
  "- Of which interest amount",
  "Total repayment amount with additional FC",
  "- Of which principal amount",
  "- Of which interest amount",
  "Total amortized repayment amount",
  "- Of which principal amount",
  "- Of which interest amount",
  "Total amortized repayment amount with additional FC",
  "- Of which principal amount",
  "- Of which interest amount");
  let a2 = Array(total_repayment[0],
  total_repayment[1] + "%",
  total_repayment[2] + "%",
  total_repayment_fc[0],
  total_repayment_fc[1] + "%",
  total_repayment_fc[2] + "%",
  total_amortized_repayment[0],
  total_amortized_repayment[1] + "%",
  total_amortized_repayment[2] + "%",
  total_amortized_repayment_fc[0],
  total_amortized_repayment_fc[1] + "%",
  total_amortized_repayment_fc[2] + "%");

  let tbl1 = create_table(i1, i2);
  let tbl2 = create_table(g1, g2);
  let tbl3 = create_table(c1, c2);
  let tbl4 = create_table(a1, a2);

  create_result("num", "Number of payments: " + EC.numberof_payments);
  create_result("pay", "Average payment amount: " + av_payment);
  create_result("am", "Amortized payment amount: " + total_int_value["amortized_payment_amount"]);
  create_result("d1", "<br><br>");

  create_result("tbl1", tbl1);
  create_result("d2", "<br><br>");
  create_result("tbl2", tbl2);
  create_result("d3", "<br><br>");
  create_result("tbl3", tbl3);
  create_result("d4", "<br><br>");
  create_result("tbl4", tbl4);
  create_result("d5", "<br><br>");

}
