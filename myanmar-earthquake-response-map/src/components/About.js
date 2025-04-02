// src/components/About.js
import React from 'react';
import './About.css';

function About({ onClose }) {
  return (
    <div className="about-container">
      <div className="about-content">
        <h2>About This Project</h2>
        <div className="about-text">
          <p>
            ငလျင်ဒဏ်ကြောင့်အကူအညီလိုအပ်နေတဲ့နေရာတွေကို report လုပ်နိုင်မယ့် website develop လုပ်ထားပါတယ်။ Rescue team တွေ supply team တွေနဲ့ damage ဖြစ်နေတဲ့နေရာတွေကိုချိတ်ဆက်ပေးဖို့ရည်ရွယ်ပါတယ်။
          </p>
          <p>
            မြေပြင်ကသူတွေကိုယ့်ပတ်၀န်းကျင်အခြေအနေတွေ လိုအပ်ချက်တွေကိုဓာတ်ပုံတွေနဲ့တကွ report လုပ်နိုင်အောင်စီစဉ်ထားပါတယ်။ (လူတိုင်း report လို့ရအောင်လုပ်ထားလို့ information အမှားများမထည့်ဖို့တော့မေတ္တာရပ်ခံပါရစေ)။
          </p>
          <p>
            100% complete တော့မဖြစ်သေးပါဘူး။ လိုအပ်ချက်များ / ပိုမိုကောင်းမွန်တဲ့ solutions များရှိရင်လဲအကြံပေး contribute လုပ်နိုင်ပါတယ်ဗျ။ Data ထည့်ပြီးလဲကူညီနိုင်ပါတယ်။ ပိုမိုကောင်းမွန်အောင်လဲပြုပြင်မွန်းမံနိုင်ပါတယ်။
          </p>
        </div>
        <button className="close-about-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default About;