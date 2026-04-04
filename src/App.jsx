import { useState, useEffect } from "react";
import { ChevronRight, CheckCircle, XCircle, RotateCcw, BookOpen, Brain, List, Lock, Crown, User, Mail, LogIn, UserPlus, LogOut } from "lucide-react";
import { Analytics } from '@vercel/analytics/react';

// localStorage storage shim (replaces window.storage for real-world deployment)
const ls = {
  get: (key) => new Promise((resolve) => {
    try {
      const val = localStorage.getItem(key);
      resolve(val ? { value: val } : null);
    } catch(e) { resolve(null); }
  }),
  set: (key, value) => new Promise((resolve) => {
    try { localStorage.setItem(key, value); resolve(true); } catch(e) { resolve(null); }
  }),
  delete: (key) => new Promise((resolve) => {
    try { localStorage.removeItem(key); resolve(true); } catch(e) { resolve(null); }
  }),
};

const LR_TEMPLATES = [
  { passage: "A recent study found that people who drink coffee daily are less likely to develop Parkinson's disease. Therefore, drinking coffee prevents Parkinson's disease.", question: "Which of the following identifies a flaw in the reasoning above?", options: ["It assumes correlation implies causation","It relies on an outdated study","It ignores alternative explanations","It overgeneralizes from a small sample","It confuses necessary and sufficient conditions"], correct: 0 },
  { passage: "Survey results show that people who exercise regularly report higher life satisfaction. Therefore, exercise causes happiness.", question: "The argument is most vulnerable to which criticism?", options: ["The sample size may be too small","It assumes correlation implies causation","It relies on self-reported data","The time period may not be representative","It fails to consider the cost of exercise"], correct: 1 },
  { passage: "Cities with more police officers have higher crime rates. Therefore, increasing police presence causes more crime.", question: "Which of the following, if true, most weakens the argument?", options: ["Cities with high crime rates hire more police in response to existing crime","Police officers receive more training in high-crime cities","Crime rates vary across neighborhoods","Most crimes go unreported","Police budgets are determined by tax revenue"], correct: 0 },
  { passage: "Manager: Employees who work from home are 15% more productive. Therefore, we should allow all employees to work remotely.", question: "The argument's conclusion follows logically if which assumption is made?", options: ["Remote work will increase productivity for all employees equally","The productivity gains outweigh any drawbacks","Office-based employees prefer working from home","The 15% figure is based on reliable data","Remote work technology is affordable"], correct: 0 },
  { passage: "Researcher: Children who read frequently perform better academically. Therefore, parents should encourage reading.", question: "Which of the following would most strengthen the argument?", options: ["Evidence that reading causes better academic performance","Studies showing academic performance is largely inherited","Data indicating most parents already encourage reading","Research on the types of books children prefer","Analysis of school library budgets"], correct: 0 },
  { passage: "All successful entrepreneurs take risks. Maria is a successful entrepreneur. Therefore, Maria takes risks.", question: "Which of the following most closely parallels the reasoning above?", options: ["All birds have feathers. Penguins are birds. Therefore, penguins have feathers.","Most doctors are well-educated. Sarah is well-educated. Therefore, Sarah is a doctor.","All plants need water. This organism needs water. Therefore, this is a plant.","Some athletes are vegetarians. John is an athlete. Therefore, John is a vegetarian.","No reptiles are mammals. Snakes are reptiles. Therefore, snakes are not mammals."], correct: 0 },
  { passage: "Either we raise taxes or the quality of education will decline. We have not raised taxes. Therefore, education quality will decline.", question: "The argument above is most vulnerable to which criticism?", options: ["It presents only two options when other alternatives may exist","It draws a conclusion broader than the evidence supports","It relies on a contradictory premise","It treats correlation as evidence of causation","It assumes what is true generally is true in this case"], correct: 0 },
  { passage: "No drug approved by the FDA has been shown to be completely without side effects. Compound X is FDA-approved. Therefore, Compound X has some side effects.", question: "The reasoning above most closely follows which pattern?", options: ["Applying a general rule to a specific case to draw a conclusion","Identifying a causal link between two observed phenomena","Drawing an analogy between two similar situations","Eliminating alternatives to arrive at the most likely cause","Appealing to expert consensus to establish a claim"], correct: 0 },
  { passage: "Some critics argue that social media harms democracy. But these critics use social media themselves. Therefore, their argument should be dismissed.", question: "The reasoning in the argument is flawed because it", options: ["Attacks the source of the argument rather than addressing its merits","Draws a sweeping conclusion from a single example","Assumes financial relationships produce false conclusions","Treats correlation as proof of causation","Relies on the opinions of non-experts"], correct: 0 },
  { passage: "Scientist: We cannot conclude this treatment is safe simply because no adverse effects have been reported. The absence of evidence is not evidence of absence.", question: "The statement above illustrates which logical principle?", options: ["Failure to find evidence for a claim does not establish the claim is false","Expert conclusions must always be verified by independent research","Causal claims require stronger evidence than correlational ones","Historical evidence is less reliable than contemporary data","Absence of a confounding variable strengthens a causal argument"], correct: 0 },
  { passage: "Every innovation that transformed society was initially dismissed by experts. Therefore, if experts dismiss an idea, it is likely to transform society.", question: "The argument above is most vulnerable to which criticism?", options: ["It draws a causal conclusion from a selected set of examples","It appeals to authority without establishing credibility","It assumes what is true of parts is true of the whole","It presents a false dilemma","It uses emotional language to substitute for logical reasoning"], correct: 0 },
  { passage: "City Council: We should not build the new highway. Every time a highway has been built near residential areas in our state, property values have decreased.", question: "Which of the following, if true, most weakens the argument?", options: ["The areas where values decreased differed in important ways from the current location","Highway construction costs have increased significantly","Property values fluctuate based on many unrelated factors","The council has previously approved highway projects","Traffic in the area has increased over the past decade"], correct: 0 },
  { passage: "Columnist: Violent crime in Millbrook has fallen every year since the community center opened. Clearly, the community center is responsible for the drop in crime.", question: "Which most accurately describes the error in the argument?", options: ["It infers a causal connection from a mere sequence of events","It draws a conclusion that goes beyond the evidence","It assumes what is true of the whole is true of its parts","It relies on biased testimony","It mistakes a necessary condition for a sufficient one"], correct: 0 },
  { passage: "No one who has won a Nobel Prize regrets the years of sacrifice required. Dr. Patel has won a Nobel Prize. Therefore, Dr. Patel does not regret the years of sacrifice.", question: "The argument above is flawed because it", options: ["Treats a sufficient condition as if it were a necessary condition","Fails to consider that the conclusion may be false even if premises are true","Relies on a premise unsupported by evidence","Confuses the meaning of two related but distinct terms","Draws a conclusion broader than the evidence warrants"], correct: 0 },
  { passage: "If the city increases park funding, residents will exercise more. If residents exercise more, healthcare costs will fall. The city increased park funding. Therefore, healthcare costs will fall.", question: "The argument above relies on which reasoning pattern?", options: ["A chain of conditional statements leading to a final conclusion","An analogy between two situations that are not sufficiently similar","An appeal to authority that does not establish the truth of the conclusion","A generalization from a single case to all cases","A circular argument in which the conclusion restates a premise"], correct: 0 },
  { passage: "Most great novelists of the twentieth century were heavy readers in their youth. James is a great twentieth-century novelist. So James was probably a heavy reader in his youth.", question: "The reasoning above is most similar to which of the following?", options: ["Most championship coaches played professional sports. Harris is a championship coach. So Harris probably played professionally.","All championship coaches played professionally. Harris is a coach. So Harris played professionally.","Some coaches played professionally. Harris played professionally. So Harris is probably a coach.","No coach who never played professionally won a championship. Harris won one. So Harris played professionally.","Most coaches who played professionally win championships. Harris played professionally. So Harris will probably win."], correct: 0 },
  { passage: "Editorial: The city should not fund the new arts center. Public money should only be spent on essential services, and the arts are not essential.", question: "The argument above depends on which assumption?", options: ["The criterion used to evaluate spending is the correct one to apply here","The arts have never provided any benefit to the public","Other similar activities have already received sufficient funding","The costs of the activity outweigh any potential benefits","Decision-makers have accurately assessed the available alternatives"], correct: 0 },
  { passage: "The board increased executive salaries by 40 percent, citing the need to attract top talent. However, employee morale surveys show a significant drop in satisfaction. Therefore, the salary increase has harmed the company.", question: "The reasoning is most vulnerable to which criticism?", options: ["It concludes a policy failed without ruling out that outcomes would have been worse without it","It relies on anecdotal evidence rather than systematic data","It appeals to authority without examining credentials","It assumes the stated goal was the only goal of the policy","It confuses a necessary condition with a sufficient one"], correct: 0 },
  { passage: "Most self-made billionaires dropped out of college. Therefore, dropping out of college increases one's chances of becoming a billionaire.", question: "The argument above is most vulnerable to which criticism?", options: ["It draws a broad causal conclusion from a selected or biased set of examples","It appeals to authority without establishing credibility","It assumes two events together means one caused the other","It presents a false dilemma by ignoring other possible outcomes","It uses emotionally charged language to substitute for logical reasoning"], correct: 0 },
  { passage: "Professor Lin argues that social media increases political polarization. But Professor Lin receives funding from a traditional media company. Therefore, her findings are biased.", question: "The argument is flawed because it", options: ["Dismisses a claim based on the source's potential bias without addressing its actual merits","Draws sweeping conclusions from a single isolated example","Assumes financial relationships always result in false conclusions","Treats correlation between funding and conclusions as proof of causation","Relies on non-experts to evaluate technical claims"], correct: 0 },
  { passage: "If an employee receives regular feedback, their performance improves. If performance improves, promotion rates increase. This department gives regular feedback. Therefore, promotion rates will increase.", question: "The argument's conclusion is properly drawn if which of the following is also assumed?", options: ["The conditional relationships described hold true in this department's case","Other departments do not also provide regular feedback","Promotion rates are the most important measure of department success","The feedback given is exclusively positive in nature","Employees in this department prefer feedback to autonomy"], correct: 0 },
  { passage: "People should not be criticized for acting in their own self-interest. Corporations are, legally speaking, persons. Therefore, corporations should not be criticized for acting in their own self-interest.", question: "The argument is most vulnerable to criticism that it", options: ["Equivocates on the word 'person,' using it in two different senses","Draws a conclusion that is broader than the evidence warrants","Relies on an appeal to authority rather than logical evidence","Assumes what is true of a part is true of the whole","Treats a correlation as evidence of causation"], correct: 0 },
  { passage: "Either this company adopts a four-day workweek or it will lose its best employees to competitors. The company has not adopted a four-day workweek. Therefore, it will lose its best employees.", question: "The argument above is most vulnerable to the criticism that it", options: ["Presents only two options when other alternatives may exist","Draws a conclusion that is stronger than the evidence warrants","Relies on a premise that contradicts information provided elsewhere","Treats correlation as evidence of causation","Assumes what is true generally must be true in this specific case"], correct: 0 },
  { passage: "Archaeologist: This city must have had a population of at least fifty thousand during the classical period. We know this because its water infrastructure was designed to serve that many people.", question: "The method of reasoning can best be described as", options: ["Inferring facts about a cause from observable characteristics of its effects","Drawing an analogy between a current situation and a historical case","Applying a universal principle to reach a conclusion about a particular case","Ruling out alternative explanations through elimination","Using statistical data to establish the most probable explanation"], correct: 0 },
  { passage: "Some members of the city council support the new transit plan. All members of the city council were elected by district voters. Therefore, some people elected by district voters support the transit plan.", question: "The pattern of reasoning above is most similar to which of the following?", options: ["Some committee members favor the amendment. All committee members hold advanced degrees. Therefore, some people with advanced degrees favor the amendment.","All committee members favor the amendment. Some hold advanced degrees. Therefore, all people with advanced degrees favor it.","Some committee members hold advanced degrees. Some people with advanced degrees favor the amendment. Therefore, some committee members favor it.","No committee members oppose the amendment. Some people with advanced degrees are committee members. Therefore, no one with an advanced degree opposes it.","All committee members favor the amendment. No one with an advanced degree is on the committee. Therefore, no one with an advanced degree favors it."], correct: 0 },
];

const RC_PASSAGES = [
  { text: "Judicial review -- the power of courts to invalidate laws conflicting with the Constitution -- was established in Marbury v. Madison (1803). Chief Justice Marshall argued courts must interpret the Constitution as supreme over ordinary laws. Critics say this gives unelected judges too much power over democratically enacted legislation. Supporters counter that it is essential for protecting constitutional rights from majority overreach.", questions: [{ q: "What best describes the main purpose of the passage?", opts: ["To argue judicial review is unconstitutional","To explain the origin and controversy surrounding judicial review","To defend the Supreme Court's power","To criticize Chief Justice Marshall","To propose reforms to the judicial system"], correct: 1 }, { q: "Critics of judicial review would most object to:", opts: ["A court interpreting an ambiguous statute","A court striking down a popular law passed by Congress","A court hearing a constitutional rights case","A court following earlier precedent","A court dismissing a lawsuit for lack of standing"], correct: 1 }] },
  { text: "AI advances have led philosophers to reconsider the nature of consciousness. Traditional theories held that consciousness requires biological neurons, but AI now exhibits behaviors once thought to require awareness. However, philosopher John Searle's Chinese Room argument holds that computational processes, no matter how complex, cannot generate genuine understanding -- they merely simulate it.", questions: [{ q: "The passage suggests critics of the Chinese Room believe:", opts: ["Biological neurons are required for consciousness","Behavioral indistinguishability from consciousness may be sufficient evidence of it","All computational processes are conscious","Consciousness cannot exist in artificial systems","Understanding and consciousness are unrelated"], correct: 1 }, { q: "According to the passage, Searle's argument claims:", opts: ["Computers will never be powerful enough to be conscious","Only biological systems can exhibit awareness","Computational processes cannot produce genuine consciousness","AI systems do not exhibit sophisticated behaviors","Traditional theories of consciousness are outdated"], correct: 2 }] },
  { text: "The placebo effect -- real improvements from inactive treatments -- puzzled researchers until neuroimaging revealed that placebos trigger actual biochemical changes including release of endorphins and dopamine. This challenges the view that placebo effects are purely psychological. Some researchers now argue the effect demonstrates the brain's capacity for self-healing and should be harnessed in medical treatment.", questions: [{ q: "Which best expresses the passage's main idea?", opts: ["The placebo effect has no biological basis","Doctors should prescribe placebos more frequently","Recent research reveals biological mechanisms underlying the placebo effect","The placebo effect undermines trust in medicine","Neuroimaging has revolutionized brain science"], correct: 2 }, { q: "The passage suggests the traditional view of the placebo effect was that it:", opts: ["Could not produce real medical improvements","Was purely psychological rather than biological","Should be used more frequently in treatment","Was caused by endorphin release","Required informed consent from patients"], correct: 1 }] },
  { text: "Quantum computers use qubits that can exist in superposition, representing both 0 and 1 simultaneously. Combined with quantum entanglement, this allows exponentially faster calculation for certain problems. However, quantum systems are extremely fragile -- the slightest environmental interference causes decoherence, a major engineering challenge that has slowed practical development.", questions: [{ q: "According to the passage, the primary advantage of quantum computers is:", opts: ["They are smaller than classical computers","They perform certain calculations exponentially faster","They use less energy","They cost less to manufacture","They are more reliable"], correct: 1 }, { q: "The passage suggests that decoherence is:", opts: ["A desirable property of quantum systems","Caused by quantum entanglement","A major challenge facing quantum computing","Only a theoretical concern","Easily preventable with current technology"], correct: 2 }] },
  { text: "The Sapir-Whorf hypothesis holds that language shapes thought and perception. Strong versions claim language determines thought, making certain concepts impossible without appropriate vocabulary. Weaker versions suggest language merely influences thought patterns. Evidence comes from studies showing speakers of different languages perceive color and spatial relationships differently. Critics note that people can readily learn new concepts from other languages.", questions: [{ q: "What best describes the difference between strong and weak versions of the hypothesis?", opts: ["Strong versions have more empirical support","Strong versions claim language determines thought; weak versions say it influences thought","Strong versions apply to all languages; weak apply only to some","Strong versions concern vocabulary; weak versions concern grammar","Strong versions are accepted by linguists; weak versions are rejected"], correct: 1 }, { q: "Critics of linguistic relativity would be most strengthened by evidence that:", opts: ["Different languages have different numbers of color terms","Language learning becomes more difficult with age","People easily acquire and use concepts from foreign languages","Cultural practices vary across linguistic communities","Speakers of the same language think differently from each other"], correct: 2 }] },
  { text: "Behavioral economics challenges the classical rational actor model. Kahneman and Tversky demonstrated through empirical research that human decision-making is riddled with systematic biases. Loss aversion shows that people feel the pain of a loss roughly twice as intensely as the pleasure of an equivalent gain. Anchoring causes people to rely disproportionately on the first piece of information they encounter. Critics argue behavioral findings are context-dependent; proponents maintain that acknowledging irrationality improves institutional design.", questions: [{ q: "The passage suggests classical economic theory's primary weakness was:", opts: ["Failure to account for systematic human irrationality","Overemphasis on empirical research at the expense of theory","Inability to explain large-scale economic phenomena","Reliance on the work of too few economists","Neglect of institutional and policy applications"], correct: 0 }, { q: "Critics of behavioral economics would most likely claim:", opts: ["Human decision-making is fundamentally rational","Loss aversion is not a genuine phenomenon","Behavioral findings cannot be reliably generalized across contexts","Classical economic theory should be entirely abandoned","Kahneman and Tversky's research methodology was flawed"], correct: 2 }] },
  { text: "Maps do not simply record geographic reality -- they shape it by deciding what to include, what to omit, and how to represent scale. The Mercator projection dramatically inflates landmasses near the poles while compressing those near the equator, making Europe and North America appear larger relative to Africa and South America than they actually are. Scholars argue this distortion reinforced colonial worldviews. Alternative projections like the Peters map have been proposed, though they introduce their own geometric tradeoffs.", questions: [{ q: "The passage's main point is best expressed as:", opts: ["The Mercator projection was deliberately designed to promote colonialism","Maps are neutral technical documents without cultural significance","Cartographic choices reflect and reinforce particular perspectives on the world","The Peters map is superior to all other projections","Geographic distortion in maps is inevitable and cannot be corrected"], correct: 2 }, { q: "The Peters map differs from Mercator primarily in that it:", opts: ["Was developed specifically for nautical navigation","Attempts to represent the relative sizes of landmasses more accurately","Eliminates all geometric distortion","Depicts Europe and North America as smaller than they actually are","Was created during the colonial period"], correct: 1 }] },
  { text: "Ocean acidification occurs when atmospheric carbon dioxide dissolves in seawater forming carbonic acid. Since industrialization, ocean surface pH has fallen by approximately 0.1 units on a logarithmic scale -- a 26 percent increase in acidity. This threatens organisms that build shells from calcium carbonate, including corals and plankton that form the base of marine food webs. The rate of acidification may outpace biological adaptation. Researchers disagree about the threshold at which ecosystem collapse becomes irreversible.", questions: [{ q: "The passage suggests ocean acidification is particularly concerning because:", opts: ["It has already caused the extinction of several plankton species","Its rate may exceed the speed at which marine organisms can adapt","Researchers have identified the precise threshold of irreversible collapse","Carbon dioxide does not naturally dissolve in seawater","Only coral reefs are affected by changes in ocean pH"], correct: 1 }, { q: "A 0.1 unit pH drop on a logarithmic scale represents:", opts: ["A negligible change posing no threat to ecosystems","A 0.1 percent increase in ocean acidity","A 26 percent increase in ocean acidity","The threshold at which ecosystem collapse becomes likely","A change affecting temperature but not chemical composition"], correct: 2 }] },
];

function makeQuestions(templates, isRC, total) {
  const out = [];
  for (let i = 0; i < total; i++) {
    let passage, question, opts, correctIdx;
    if (isRC) {
      const p = templates[i % templates.length];
      const qi = Math.floor(i / templates.length) % p.questions.length;
      passage = p.text; question = p.questions[qi].q;
      opts = [...p.questions[qi].opts]; correctIdx = p.questions[qi].correct;
    } else {
      const t = templates[i % templates.length];
      passage = t.passage; question = t.question;
      opts = [...t.options]; correctIdx = t.correct;
    }
    let h = ((i * 2246822519 + 1) >>> 0);
    const ord = [0,1,2,3,4];
    for (let s = 4; s > 0; s--) {
      h = ((h ^ (h >>> 16)) >>> 0); h = ((h * 2246822519) >>> 0); h = ((h ^ (h >>> 13)) >>> 0);
      const j = h % (s + 1); const tmp = ord[s]; ord[s] = ord[j]; ord[j] = tmp;
    }
    out.push({ passage, question, options: ord.map(o => opts[o]), correct: ord.indexOf(correctIdx) });
  }
  return out;
}

const ALL_LR = makeQuestions(LR_TEMPLATES, false, 1300);
const ALL_RC = makeQuestions(RC_PASSAGES, true, 1300);

const LEARN = {
  lr: {
    title: "Logical Reasoning", color: "bg-indigo-600",
    overview: ["The LR section makes up two of the four scored sections, with 24-26 questions per section and 35 minutes each.", "Every question has a short stimulus, a question stem, and five answer choices. Your job is to interact with the argument as the question demands.", "There are 9 major LR question types covered in this section: Flaw, Assumption, Strengthen/Weaken, Must Be True, Parallel Reasoning, Principle, Method of Reasoning, Point at Issue, and Sufficient/Necessary Conditions.", "Success requires methodical thinking -- find the conclusion and premises first, anticipate the answer type, then eliminate wrong choices systematically."],
    articles: [
      { id: "lr-flaw", title: "Flaw in the Reasoning", icon: "Flaw", summary: "Identify the logical error that undermines the argument", sections: [
        { heading: "What It Is", body: "Flaw questions ask you to identify the specific logical error in the stimulus. The correct answer describes a reasoning mistake that actually occurs in the argument -- not just a possible weakness, but the exact flaw present." },
        { heading: "How to Identify the Question Type", bullets: ["The reasoning in the argument is flawed because...", "The argument is vulnerable to criticism on the grounds that...", "Which of the following identifies a flaw in the argument?"] },
        { heading: "Attack Strategy", bullets: ["Step 1: Find the conclusion -- what is the author claiming?", "Step 2: Find the premises -- what evidence supports it?", "Step 3: Ask where the logical leap happens -- what does the argument assume without proving?", "Step 4: Name the flaw before reading the answers", "Step 5: Match your named flaw to the answer choices; eliminate answers that describe flaws not present"] },
        { heading: "Most Common Flaw Types", bullets: ["Correlation/Causation: assuming A causes B because they occur together", "False Dichotomy: treating two options as exhaustive when others exist", "Circular Reasoning: using the conclusion as evidence for itself", "Ad Hominem: attacking the person rather than the argument", "Hasty Generalization: drawing broad conclusions from insufficient evidence", "Scope Shift: subtly changing a key term between premise and conclusion"] },
        { heading: "Example Problem", body: "Stimulus: 'Students who listen to classical music while studying score higher on tests than those who do not. Therefore, listening to classical music improves academic performance.' Flaw: The argument assumes the correlation means causation. Higher-scoring students may simply prefer classical music, or a third factor (like study habits) explains both." },
        { heading: "Common Wrong Answer Traps", bullets: ["Answers describing flaws that would weaken the argument but aren't actually in the stimulus", "Answers using extreme language when the actual flaw is more nuanced", "Answers about irrelevant aspects of the argument"] },
        { heading: "Top Tips", bullets: ["Anticipate the flaw before looking at answers -- this is the single most effective habit", "The correct answer must describe something that actually happens in THIS argument", "If you can't name the flaw, use the negation test: which answer, if true, shows the reasoning breaks down?"] }
      ]},
      { id: "lr-assumption", title: "Assumption Questions", icon: "Assum", summary: "Find the unstated premise the argument depends on", sections: [
        { heading: "What It Is", body: "Every argument has gaps -- unstated beliefs the author takes for granted. Assumption questions ask you to find the premise the argument requires but never states. Two types: Necessary Assumption (must be true for argument to work) and Sufficient Assumption (if true, guarantees the conclusion follows)." },
        { heading: "How to Identify the Question Type", bullets: ["The argument assumes which of the following?", "The conclusion follows logically if which of the following is assumed?", "Which of the following is an assumption required by the argument?"] },
        { heading: "The Negation Test", body: "For Necessary Assumption: negate each answer choice. If negating it destroys the argument, that is your answer. If the argument survives without it, eliminate it. This is the most reliable tool for this question type." },
        { heading: "Attack Strategy", bullets: ["Step 1: Identify the conclusion and premises", "Step 2: Find the gap -- what concept in the conclusion was not established by the premises?", "Step 3: The assumption bridges this gap", "Step 4: For Necessary Assumption: apply the Negation Test to confirm", "Step 5: For Sufficient Assumption: look for an answer that, added as a premise, makes the conclusion airtight"] },
        { heading: "Example Problem", body: "Stimulus: 'Sales of electric vehicles have tripled in five years. Therefore, environmental awareness among consumers has increased.' Gap: The argument assumes EV purchases are driven by environmental concern, not cost savings, tax credits, or technology appeal. A necessary assumption: EV buyers are primarily motivated by environmental concerns." },
        { heading: "Common Wrong Answer Traps", bullets: ["Answers that strengthen the argument but are not strictly required", "Answers introducing concepts not present in the original argument", "Answers that are true in the real world but irrelevant to this specific gap"] },
        { heading: "Top Tips", bullets: ["The assumption will always bridge the exact gap between premises and conclusion", "Never bring in outside information -- the assumption must come from the argument's own logic", "Sufficient Assumption answers tend to be broader and more conditional than Necessary Assumption answers"] }
      ]},
      { id: "lr-strengthen", title: "Strengthen and Weaken", icon: "S/W", summary: "Add evidence that supports or undermines the argument", sections: [
        { heading: "What It Is", body: "Strengthen and Weaken questions ask you to find new external information that either bolsters or undermines the argument's conclusion. Unlike Flaw questions, the answers introduce new evidence not in the stimulus." },
        { heading: "How to Identify the Question Type", bullets: ["Which of the following, if true, most strengthens the argument?", "Which of the following, if true, most seriously weakens the argument?", "Which of the following would most support the argument above?"] },
        { heading: "Strengthen: Look For", bullets: ["A causal mechanism that explains why the correlation occurs", "Evidence eliminating the most obvious alternative explanations", "Confirmation that the sample or comparison is representative", "Data showing the relationship holds in similar contexts"] },
        { heading: "Weaken: Look For", bullets: ["An alternative explanation for the evidence presented", "Evidence that the correlation does not imply causation here", "Proof that comparison cases differ in important ways", "A counterexample that the conclusion fails to account for"] },
        { heading: "Example Problem", body: "Argument: 'City X installed red-light cameras and traffic accidents fell 30%. Therefore, red-light cameras reduce accidents.' Strengthen: Studies from other cities show similar accident reductions after camera installation. Weaken: City X also hired 200 more traffic officers during the same period." },
        { heading: "The If-True Rule", body: "Always accept the answer choice as true and ask only whether it helps or hurts the conclusion. Do not debate its real-world plausibility. The question tests your logical reasoning, not your outside knowledge." },
        { heading: "Top Tips", bullets: ["The correct answer must affect the specific conclusion, not just a premise", "For Weaken, you do not need to destroy the argument -- just make it less likely to be true", "Wrong answers often affect a side point rather than the main conclusion"] }
      ]},
      { id: "lr-inference", title: "Must Be True / Inference", icon: "MBT", summary: "Draw valid conclusions directly from the stimulus", sections: [
        { heading: "What It Is", body: "Must Be True questions do not present a flawed argument. The stimulus is a set of facts, and you must identify which answer is guaranteed to be true based solely on those facts. The key word is MUST -- not could be, not probably is." },
        { heading: "How to Identify the Question Type", bullets: ["Which of the following can be properly inferred from the statements above?", "If the statements above are true, which of the following must also be true?", "The statements above most strongly support which of the following?"] },
        { heading: "Attack Strategy", bullets: ["Step 1: Read the stimulus as a list of facts, not an argument -- there is no flaw to find", "Step 2: Note key logical relationships: if/then, all, some, none, most, percentages", "Step 3: The correct answer should follow necessarily -- it should feel close to obvious", "Step 4: Eliminate answers that go beyond what the facts guarantee", "Step 5: Be especially alert to conditional logic and contrapositives"] },
        { heading: "Conditional Logic Guide", body: "If the stimulus says 'All A are B,' you can infer: (1) If something is A, it is B. (2) If something is NOT B, it is NOT A (contrapositive). You CANNOT infer: All B are A. This is the most common trap on MBT questions." },
        { heading: "Example Problem", body: "Stimulus: 'All students who passed the bar exam completed the ethics course. Some students who completed the ethics course attended the prep seminar.' Must Be True: Some students who passed the bar exam completed the ethics course. CANNOT infer: All students who completed the ethics course passed the bar exam." },
        { heading: "Common Wrong Answer Traps", bullets: ["Answers that are plausible or likely but not guaranteed by the facts", "Answers that reverse the direction of a conditional statement", "Answers that import outside information not stated in the stimulus"] },
        { heading: "Top Tips", bullets: ["If an answer requires any assumption beyond the stimulus, eliminate it", "'Most' does not mean all -- be precise about what quantifiers guarantee", "The correct answer often feels too obvious -- that is usually a good sign"] }
      ]},
      { id: "lr-parallel", title: "Parallel Reasoning", icon: "Para", summary: "Match the logical structure of the argument", sections: [
        { heading: "What It Is", body: "Parallel Reasoning questions ask you to find an answer that uses the exact same pattern of reasoning as the stimulus. The subject matter is completely irrelevant -- only the logical structure matters." },
        { heading: "How to Identify the Question Type", bullets: ["Which of the following arguments is most similar in its reasoning to the argument above?", "The pattern of reasoning in which of the following is most parallel to the reasoning above?"] },
        { heading: "Attack Strategy", bullets: ["Step 1: Abstract the structure -- replace content with variables (All A are B; X is A; therefore X is B)", "Step 2: Note the conclusion type -- conditional, categorical, comparative?", "Step 3: Note whether the argument is VALID or FLAWED", "Step 4: Eliminate answers with a different number of premises, conclusion type, or validity", "Step 5: Match the abstract structure precisely to the remaining answers"] },
        { heading: "Valid vs. Flawed Parallel", body: "Critical rule: if the original argument is flawed (e.g., affirming the consequent), the correct parallel must also be flawed in the same way. If the original is valid, the parallel must also be valid. Never choose a valid answer to match a flawed stimulus or vice versa." },
        { heading: "Example Problem", body: "Stimulus (flawed): 'All champions train hard. Alex trains hard. Therefore, Alex is a champion.' Structure: All A are B; X is B; therefore X is A. (This is invalid -- affirming the consequent.) Parallel: 'All published authors write daily. Maria writes daily. Therefore, Maria is a published author.' Same invalid structure." },
        { heading: "Top Tips", bullets: ["Abstract the structure before looking at answers -- this alone eliminates most wrong answers quickly", "Subject matter similarity is a trap -- ignore it completely", "For Parallel Flaw specifically, identify the exact flaw type first"] }
      ]},
      { id: "lr-principle", title: "Principle Questions", icon: "Prin", summary: "Apply or identify the general rule behind the argument", sections: [
        { heading: "What It Is", body: "Principle questions bridge abstract rules and concrete situations. Identify the Principle: given a specific situation, find the general rule that justifies the reasoning. Apply the Principle: given a general rule, find the situation it applies to or use it to justify a conclusion." },
        { heading: "Identify the Principle -- Attack Strategy", bullets: ["Step 1: Find the conclusion and premises of the stimulus", "Step 2: Ask: what general rule, if true, would make this reasoning valid?", "Step 3: The correct answer should be broad (a rule) but precise enough to apply directly to the stimulus"] },
        { heading: "Apply the Principle -- Attack Strategy", bullets: ["Step 1: Identify all conditions in the principle precisely -- note every 'if,' 'only if,' 'unless,' and 'when'", "Step 2: For each answer, check whether the situation satisfies the rule's trigger conditions", "Step 3: Then check whether the conclusion drawn in the answer actually follows from applying the rule"] },
        { heading: "Example Problem", body: "Principle: 'A company should discontinue a product only if that product generates consistent losses AND no foreseeable market exists.' Application: Company X's product has lost money for three years but analysts predict a new market will emerge. Answer: Company X should NOT discontinue the product because the second condition (no foreseeable market) is not met." },
        { heading: "Common Wrong Answer Traps", bullets: ["Answers that capture the spirit of the principle but miss a specific condition", "Answers where the situation matches but the conclusion drawn is wrong", "Answers that apply a related but subtly different principle"] },
        { heading: "Top Tips", bullets: ["Read the principle with extreme precision -- every word in a conditional statement matters", "Wrong answers often satisfy SOME conditions of the principle but not ALL", "Principle questions reward careful reading more than any other type"] }
      ]},
      { id: "lr-method", title: "Method of Reasoning", icon: "Meth", summary: "Describe how the argument makes its case", sections: [
        { heading: "What It Is", body: "Method of Reasoning questions ask you to describe the argumentative technique the author uses -- not what the argument concludes, but HOW it argues. These are meta-questions about logical strategy." },
        { heading: "How to Identify the Question Type", bullets: ["Which of the following describes the technique used in the argument?", "The argument proceeds by...", "The author's strategy in responding to the criticism is to..."] },
        { heading: "Common Argumentative Techniques", bullets: ["Counterexample: offering a specific case that disproves a general claim", "Analogy: drawing a comparison between two situations to support a conclusion", "Eliminating alternatives: ruling out other explanations to support one", "Appealing to consequences: arguing for or against a position based on its results", "Distinguishing cases: showing that two situations the opponent treats as similar are actually different", "Conceding and rebutting: acknowledging a point then showing it does not support the conclusion"] },
        { heading: "Example Problem", body: "Stimulus: 'My opponent claims all tax cuts benefit the wealthy. But the 2003 child tax credit expansion benefited millions of middle-income families.' Technique: The author offers a counterexample to disprove the opponent's general claim." },
        { heading: "Top Tips", bullets: ["Read the stimulus and narrate what the author is doing step by step before looking at answers", "The correct answer describes the technique at the right level -- not too specific (content-tied) and not too vague", "Wrong answers often describe techniques that WOULD strengthen the argument but are not what the author actually does"] }
      ]},
      { id: "lr-point-at-issue", title: "Point at Issue", icon: "PAI", summary: "Identify exactly what two speakers disagree about", sections: [
        { heading: "What It Is", body: "Point at Issue questions present a dialogue between two speakers and ask you to identify what they actually disagree about. The correct answer must be something that one speaker would affirm and the other would deny." },
        { heading: "How to Identify the Question Type", bullets: ["The dialogue above provides the most support for the claim that the two speakers disagree about...", "The speakers disagree over whether...", "The point at issue between the two speakers is..."] },
        { heading: "The Two-Speaker Test", body: "For each answer choice, ask: (1) Does speaker A have a clear position on this? (2) Does speaker B have a clear position on this? (3) Are their positions opposed? If any one of these is no, eliminate the answer. The correct answer requires a yes to all three." },
        { heading: "Example Problem", body: "Speaker A: 'Remote work increases productivity -- our team's output rose 20% after going remote.' Speaker B: 'The output increase happened because we hired three experienced engineers that month, not because of remote work.' Point at Issue: Whether the output increase was caused by remote work. A says yes; B says no." },
        { heading: "Common Wrong Answer Traps", bullets: ["Answers about topics only one speaker addresses -- the other speaker must also have a position", "Answers where both speakers actually agree (a common misdirection)", "Answers that are related to the topic but not the actual point of disagreement"] },
        { heading: "Top Tips", bullets: ["Always apply the two-speaker test to every answer choice", "The speakers' actual positions must be identifiable from the text -- do not infer beyond what they state", "Wrong answers often involve topics adjacent to the disagreement but not the disagreement itself"] }
      ]},
      { id: "lr-sufficient-necessary", title: "Sufficient and Necessary Conditions", icon: "S/N", summary: "Master conditional logic -- the foundation of LR success", sections: [
        { heading: "What It Is", body: "Conditional logic appears throughout the LSAT in many question types. Understanding sufficient and necessary conditions is foundational to LR success. A sufficient condition guarantees the result. A necessary condition is required for the result but does not guarantee it." },
        { heading: "The Core Relationship", bullets: ["If A then B: A is sufficient for B; B is necessary for A", "Contrapositive: If NOT B then NOT A (always valid)", "Converse: If B then A (INVALID -- this is the most common trap)", "Inverse: If NOT A then NOT B (INVALID)"] },
        { heading: "Key Indicator Words", bullets: ["Sufficient triggers: if, when, whenever, all, every, any, whoever", "Necessary triggers: only if, unless, requires, must, without, need"] },
        { heading: "Unless Statements", body: "'Unless B, then A' translates to: If NOT B, then A. The contrapositive is: If NOT A, then B. The word 'unless' is one of the most tested conditional structures on the LSAT. Treat it carefully." },
        { heading: "Example Problem", body: "Statement: 'A bill becomes law only if it passes both chambers.' Necessary condition: passing both chambers (required for law). NOT sufficient (the president must also sign). Contrapositive: If a bill did NOT pass both chambers, it did NOT become law." },
        { heading: "Top Tips", bullets: ["Always write out conditional statements formally when you encounter them", "The contrapositive is always valid; the converse is almost never valid on the LSAT", "Chain conditionals: If A then B; If B then C; therefore If A then C -- and contrapositive: If not C then not A"] }
      ]}
    ]
  },
  rc: {
    title: "Reading Comprehension", color: "bg-purple-600",
    overview: ["The RC section contains four passage sets with 5-8 questions each, approximately 27 questions in 35 minutes.", "Passages come from humanities, social sciences, natural sciences, and law. The challenge is the nuance and layering of ideas.", "There are 7 major RC question types covered in this section: Main Point, Inference, Function of a Detail, Author Tone/Attitude, Passage Structure, Comparative Reading, and Active Reading Strategy.", "Strong RC performance requires active reading -- mapping the author's argument as you go rather than passively absorbing information."],
    articles: [
      { id: "rc-mainpoint", title: "Main Point and Primary Purpose", icon: "Main", summary: "Identify what the passage is fundamentally about", sections: [
        { heading: "What It Tests", body: "Main Point and Primary Purpose questions ask you to identify the central argument or controlling idea of the entire passage. They test whether you read the passage as a unified whole rather than a collection of isolated details." },
        { heading: "How to Identify the Question Type", bullets: ["Which of the following most accurately expresses the main point of the passage?", "The primary purpose of the passage is to...", "Which of the following best describes the overall argument?"] },
        { heading: "Attack Strategy", bullets: ["Step 1: As you read, track the author's argument -- what is the author ultimately trying to argue or convey?", "Step 2: Pay special attention to the first and last paragraphs -- main points often appear there", "Step 3: Watch for thesis signals: therefore, thus, in conclusion, ultimately, the key point is", "Step 4: The correct answer must cover the ENTIRE passage, not just one section"] },
        { heading: "The Scope Test", body: "Ask of each answer: does the passage spend most of its time arguing for this? If yes, it is a candidate. If the passage only briefly mentions the topic, eliminate it. The correct answer is neither too broad (vague) nor too narrow (a detail)." },
        { heading: "Example Problem", body: "Passage: Four paragraphs arguing that urban green spaces reduce crime, with evidence from multiple cities, a discussion of the psychological mechanisms, and a policy recommendation. Main Point: Urban green spaces reduce crime and cities should invest in them. Wrong answers: 'Crime has many causes' (too broad) or 'Chicago's parks reduced crime' (too narrow)." },
        { heading: "Common Wrong Answer Traps", bullets: ["Too narrow: describes only one paragraph's content", "Too broad: makes a claim bigger than anything the passage argues", "Opposite: reverses the author's actual position", "Distorted: accurately describes a detail but misrepresents its role in the whole"] },
        { heading: "Top Tips", bullets: ["The main point is usually something the author argues FOR, not just describes", "If an answer would require only one paragraph to support it, it is probably too narrow", "Correct answers often include the author's evaluative stance, not just the topic"] }
      ]},
      { id: "rc-inference", title: "Inference and Must Be True", icon: "Infer", summary: "Draw conclusions the passage supports but does not state", sections: [
        { heading: "What It Tests", body: "RC Inference questions ask you to identify something that must be true based on the passage, even though it is not directly stated. The answer must be strongly supported by evidence in the passage -- a small logical step, not a leap." },
        { heading: "How to Identify the Question Type", bullets: ["Which of the following can be inferred from the passage?", "The author would most likely agree with which of the following?", "The passage most strongly implies that...", "It can be concluded from the passage that..."] },
        { heading: "Attack Strategy", bullets: ["Step 1: Do not answer from memory -- go back and find the specific lines that support the inference", "Step 2: The correct answer should be nearly obvious given what the passage says", "Step 3: For 'the author would agree' questions, the answer must match the author's demonstrated attitude, not just the topic", "Step 4: Apply the Must Be True standard -- not 'could be true' or 'probably true'"] },
        { heading: "Example Problem", body: "Passage states: 'Unlike classical economists, behavioral economists have consistently found that human decision-making deviates from rational models in predictable ways.' Inference: Classical economists believed human decision-making followed rational models. NOT a valid inference: All economists now accept behavioral findings." },
        { heading: "Common Wrong Answer Traps", bullets: ["Answers that sound reasonable but go beyond what the passage actually supports", "Answers that confuse a view the author DESCRIBES with a view the author ENDORSES", "Answers that are true in the real world but not supported by this specific passage"] },
        { heading: "Top Tips", bullets: ["If you cannot point to specific lines in the passage that support the answer, it is probably wrong", "Answers that are extremely obvious tend to be correct on inference questions -- do not overthink", "'Must be true' is a very high standard; eliminate anything that only might be true"] }
      ]},
      { id: "rc-function", title: "Function of a Detail", icon: "Func", summary: "Explain why a specific detail appears in the passage", sections: [
        { heading: "What It Tests", body: "Function questions ask why a specific word, phrase, sentence, or paragraph appears in the passage -- not what it means, but what argumentative or organizational role it plays. These reward structural reading." },
        { heading: "How to Identify the Question Type", bullets: ["The author mentions X primarily in order to...", "The function of the second paragraph is to...", "Why does the author include the example of X?", "The reference to X serves to..."] },
        { heading: "Attack Strategy", bullets: ["Step 1: Go back and read the detail in context -- read the sentences immediately before and after it", "Step 2: Ask: what is the author DOING here? Is this example, objection, evidence, contrast, or transition?", "Step 3: The correct answer describes the ROLE in the argument using language like: to illustrate, to contrast, to support, to introduce, to qualify"] },
        { heading: "Roles a Detail Can Play", bullets: ["Providing a concrete example to illustrate an abstract claim", "Introducing an objection the author will then refute", "Offering evidence supporting the main argument", "Creating a contrast with another position or time period", "Qualifying or limiting a claim the author just made", "Transitioning between two major sections of the passage"] },
        { heading: "Example Problem", body: "Passage argues renewable energy is economically viable, then mentions 'the 2008 financial crisis temporarily slowed solar investment.' Function: to acknowledge a potential counterexample while showing it was temporary, supporting the overall argument that renewables are viable long-term." },
        { heading: "Top Tips", bullets: ["The function is always in service of the author's larger argument -- connect every detail to the main point", "Wrong answers often accurately describe what the detail SAYS rather than why it is THERE", "Anticipate the function before looking at answer choices"] }
      ]},
      { id: "rc-attitude", title: "Author Tone and Attitude", icon: "Tone", summary: "Understand how the author feels about the subject", sections: [
        { heading: "What It Tests", body: "Tone and Attitude questions ask you to characterize how the author feels about the subject matter, a specific theory, a group of people, or a piece of evidence. LSAT authors are almost never perfectly neutral -- they have measured but discernible perspectives." },
        { heading: "How to Identify the Question Type", bullets: ["The author's attitude toward X can best be described as...", "Which of the following best describes the tone of the passage?", "The author regards the theory described in the second paragraph with..."] },
        { heading: "Reading for Tone During Active Reading", bullets: ["'Unfortunately...' -- author disapproves of something", "'Surprisingly...' -- author finds something unexpected or noteworthy", "'Despite X...' -- author acknowledges a counterpoint but maintains position", "'What is often overlooked...' -- author is making a corrective argument", "'Proponents claim... however...' -- author is about to disagree with proponents"] },
        { heading: "Attack Strategy", bullets: ["Step 1: As you read, underline evaluative language -- adjectives, adverbs, and word choices that signal opinion", "Step 2: Distinguish between views the author DESCRIBES and views the author HOLDS", "Step 3: LSAT correct answers tend to be moderate -- eliminate extreme language in wrong answers", "Step 4: Common correct tones: qualified support, cautious optimism, measured skepticism, critical but acknowledging"] },
        { heading: "Example Problem", body: "Passage describes a new archaeological theory with phrases like 'the evidence, while suggestive, remains incomplete' and 'the theory merits serious consideration despite its preliminary nature.' Author's attitude: Cautiously receptive -- interested but not fully committed. Wrong answers: 'enthusiastic endorsement' (too strong) or 'outright rejection' (opposite)." },
        { heading: "Top Tips", bullets: ["Extreme attitude words (contempt, outrage, uncritical admiration) are almost always wrong on the LSAT", "Authors can be critical of one aspect while supportive of another -- read carefully for nuance", "If the author presents multiple perspectives, determine which one they ultimately favor"] }
      ]},
      { id: "rc-structure", title: "Passage Structure and Organization", icon: "Struc", summary: "Map how the passage is organized and why", sections: [
        { heading: "What It Tests", body: "Structure questions ask how the passage is organized -- how paragraphs relate to each other, how the argument is built, or what overall pattern the author follows. These reward readers who track structure while reading." },
        { heading: "How to Identify the Question Type", bullets: ["Which of the following best describes the organization of the passage?", "The relationship between the first and second paragraphs is...", "Which of the following accurately describes the structure of the passage's argument?"] },
        { heading: "Common LSAT Passage Structures", bullets: ["Problem then Solution: author identifies a problem and proposes or evaluates a fix", "Theory A vs Theory B: author presents two competing explanations and evaluates them", "Conventional Wisdom then Challenge: author describes what people believe, then challenges it", "Historical Background then Contemporary Application: past context leading to present implications", "Phenomenon then Explanation: something is described and then its causes are analyzed"] },
        { heading: "Building Your Passage Map", body: "After each paragraph, jot a brief function note: 'introduces problem,' 'presents theory A,' 'criticizes theory A,' 'offers alternative,' 'concludes with implications.' The correct answer to a structure question will describe these functions in the right sequence." },
        { heading: "Example Problem", body: "Paragraph 1: Describes traditional view of dinosaur extinction. Paragraph 2: Presents asteroid impact theory. Paragraph 3: Discusses evidence supporting impact theory. Paragraph 4: Acknowledges remaining questions but endorses impact theory. Structure: 'The passage presents a traditional view, then introduces and supports an alternative explanation, while acknowledging its limitations.'" },
        { heading: "Top Tips", bullets: ["Structure knowledge helps you answer ALL question types faster -- invest in mapping every passage", "The structure of the answer choices mirrors the structure of the passage -- match them sequentially", "Wrong answers often get the sequence of paragraphs wrong or mischaracterize one section's role"] }
      ]},
      { id: "rc-comparative", title: "Comparative Reading", icon: "Comp", summary: "Handle paired passages and their relationship", sections: [
        { heading: "What It Is", body: "One of the four RC sets consists of two shorter passages on the same general topic. Questions ask about each passage individually and about how they relate to each other. The comparative reading set tests your ability to hold two perspectives in mind simultaneously." },
        { heading: "Attack Strategy for Paired Passages", bullets: ["Step 1: Read Passage A fully and identify its main point, argument, and author's attitude", "Step 2: Read Passage B with Passage A in mind -- as you read, note agreements and disagreements", "Step 3: Before reading questions, articulate the relationship in one sentence: 'B challenges A's claim about X while agreeing about Y'", "Step 4: Answer questions about each passage individually first, then tackle the relationship questions"] },
        { heading: "Common Passage Relationships", bullets: ["One supports the other's thesis with different evidence", "One challenges or qualifies the other's central claim", "They address the same phenomenon with different explanations", "They share a conclusion but reach it by different paths", "One provides historical context for the other's contemporary argument"] },
        { heading: "Key Question Types for Comparative Reading", bullets: ["'Both authors would agree that...' -- find a claim supported by evidence in BOTH passages", "'The authors disagree about...' -- find an issue where positions are directly opposed", "'How would Author B respond to the argument in Passage A?' -- apply B's position to A's claims", "'The relationship between the passages is...' -- describe the structural/argumentative relationship"] },
        { heading: "Example Problem", body: "Passage A argues that social media increases political polarization by creating echo chambers. Passage B argues that social media actually exposes users to more diverse views than traditional media. Agreement: Both acknowledge social media affects political views. Disagreement: Whether the effect increases or decreases polarization." },
        { heading: "Top Tips", bullets: ["Never attribute to both authors a view that only one holds -- a common trap", "The relationship question is usually the hardest -- save it for last after understanding each passage", "Map each passage separately before identifying the relationship"] }
      ]},
      { id: "rc-activeread", title: "Active Reading Strategy", icon: "Read", summary: "How to read LSAT passages for maximum retention and speed", sections: [
        { heading: "Why Active Reading Is Essential", body: "Most students read LSAT passages passively, absorbing information like a novel. This leads to vague impressions and constant re-reading during questions. Active reading means engaging with the argument as you go -- tracking purpose, noting structure shifts, and flagging evaluative language." },
        { heading: "The Active Reading Framework", bullets: ["For each paragraph, answer three questions: (1) What is the author DOING here? (introducing, arguing, conceding, contrasting, concluding) (2) What is the author SAYING? (the main claim in one sentence) (3) How does it CONNECT to what came before?"] },
        { heading: "What to Mark As You Read", bullets: ["The thesis or main point -- often in paragraph 1 or the final paragraph", "Contrast signals: however, but, yet, on the other hand, despite, although", "Emphasis signals: importantly, crucially, the key point, above all", "The author's evaluative language -- words that reveal opinion or attitude", "Names of theories, scholars, or studies and the author's attitude toward each"] },
        { heading: "Building a Passage Map", body: "After each paragraph, write a brief note: 'P1: introduces X controversy. P2: traditional view -- A causes B. P3: new research -- B causes A. P4: author endorses new view, calls for further study.' Your map becomes the navigation tool for answering questions without full re-reading." },
        { heading: "Time Management", body: "Spend 3-4 minutes reading and mapping, then 1-1.5 minutes per question. Students who rush reading spend far more time on questions. Invest in the reading phase -- it pays dividends on every question that follows." },
        { heading: "Top Tips", bullets: ["Never answer from memory -- always return to the passage, but use your map to find the right section fast", "The more complex the passage, the more important your map becomes -- do not skip mapping for hard passages", "Treat RC like a conversation with the author -- stay engaged and curious about what they are trying to prove"] }
      ]}
    ]
  },
  lsat: {
    title: "The LSAT Structure", color: "bg-emerald-600",
    overview: ["Understanding how the LSAT is structured is as important as knowing the content.", "The LSAT consists of scored sections plus one unscored writing sample, with 35 minutes for each section.", "Preparation is not just about learning material -- it is also about building stamina and managing time under pressure."],
    articles: [
      { id: "lsat-structure", title: "How the LSAT Is Structured", icon: "Str", summary: "A complete breakdown of every section of the test", sections: [{ heading: "The Three Scored Sections", bullets: ["Logical Reasoning: two sections, approximately 24-26 questions each, 35 minutes per section", "Reading Comprehension: one section, four passage sets with 5-8 questions each, 35 minutes"] }, { heading: "The Experimental Section", body: "Every LSAT includes one unscored experimental section that looks identical to a real section. You will not know which section is experimental, so treat every section as if it counts." }, { heading: "Score Scale", body: "LSAT scores range from 120 to 180. The median score is approximately 151. There is no penalty for wrong answers -- always guess rather than leave a question blank." }] },
      { id: "lsat-timing", title: "How to Manage Your Time", icon: "Time", summary: "Section-by-section pacing strategies to maximize your score", sections: [{ heading: "Logical Reasoning Pacing", body: "With roughly 25 questions in 35 minutes, you have about 84 seconds per question. Never spend more than 2 minutes on any single question -- if stuck, guess and move on." }, { heading: "Reading Comprehension Pacing", body: "With four passage sets in 35 minutes, aim for about 8-9 minutes per set. Spend 3-4 minutes reading and mapping, then 1-1.5 minutes per question." }, { heading: "The Two-Pass Strategy", body: "Do a first pass through all questions and answer the ones you are confident about. Skip or guess on questions taking too long. Return to skipped questions with remaining time." }] },
      { id: "lsat-testday", title: "How to Prepare for Test Day", icon: "Day", summary: "Everything you need to do before, during, and after the exam", sections: [{ heading: "The Week Before", bullets: ["Do not cram -- review strategies you already know and do light practice", "Take one full timed practice test early in the week, then rest", "Confirm your test center location or online testing setup"] }, { heading: "The Night Before", bullets: ["Do not study -- your brain needs rest, not more input", "Prepare everything you need: ID, admission ticket, snacks, water", "Go to bed at your normal time or slightly earlier"] }, { heading: "During the Test", bullets: ["Treat every section as if it counts", "Use the break to reset mentally", "If a section goes badly, leave it behind -- each section is a fresh start"] }] },
    ]
  },
  admissions: {
    title: "Law School Admissions", color: "bg-rose-600",
    overview: ["Getting into law school is about far more than your LSAT score. Admissions committees evaluate your entire application as a picture of who you are, what you have accomplished, and what kind of lawyer you will become.", "Your GPA and LSAT score open doors, but your personal statement, letters of recommendation, resume, and addenda are what differentiate you from other qualified applicants.", "The T14 -- the top 14 law schools as ranked by US News -- are the most competitive programs in the country and admit students with median LSAT scores above 170 at the very top. Understanding what each school values helps you craft a targeted application."],
    articles: [
      { id: "adm-overview", title: "How Law School Admissions Works", icon: "How", summary: "A complete guide to the application process from start to finish", sections: [
        { heading: "The Key Components of Your Application", bullets: ["LSAT score -- the single most heavily weighted factor at most schools", "GPA -- undergraduate cumulative GPA reported to LSAC", "Personal statement -- 2-4 pages, the heart of your application", "Letters of recommendation -- typically 2-3 from professors or supervisors", "Resume -- your academic, professional, and extracurricular record", "Diversity statement -- optional but valuable if you have a unique background", "Addenda -- explanations for GPA gaps, LSAT retakes, or disciplinary issues"] },
        { heading: "How Schools Evaluate Applications", body: "Most schools use an index score combining your LSAT and GPA to do initial sorting, then holistic review for competitive candidates. A strong LSAT can compensate for a lower GPA at many schools, but the reverse is less common. Admissions cycles run from September through April, and applying early -- ideally in September or October -- meaningfully increases your chances at most schools." },
        { heading: "Application Timeline", bullets: ["June-August: Take or retake the LSAT, request transcripts, line up recommenders", "September-October: Submit applications as soon as schools open -- early applicants have a real advantage", "November-February: Complete any remaining applications, respond to interview invitations", "March-May: Receive decisions, compare financial aid packages, commit by April 15"] },
        { heading: "LSAC and CAS", body: "All law school applications flow through LSAC, the Law School Admission Council. You register at LSAC.org, submit your transcripts to their Credential Assembly Service (CAS), and applications are transmitted from there. Budget $200-400 for LSAC fees, plus individual school application fees of $60-100 each." }
      ]},
      { id: "adm-personalstatement", title: "The Personal Statement Guide", icon: "PS", summary: "How to write a compelling personal statement that stands out", sections: [
        { heading: "What Admissions Committees Are Looking For", body: "The personal statement is your only opportunity to speak directly to the admissions committee in your own voice. They want to understand why you want to be a lawyer, what experiences have shaped that decision, and what you will contribute to their school and the legal profession. Generic statements about wanting to help people or loving debate rarely impress." },
        { heading: "The Golden Rule: Show, Do Not Tell", body: "The most common mistake is making assertions without evidence. Do not write 'I am passionate about justice.' Write a scene, tell a story, describe a moment that shows your relationship with justice. Concrete and specific is always stronger than abstract and general. Every claim you make should be illustrated with a specific example." },
        { heading: "Structure That Works", bullets: ["Opening: A compelling scene, moment, or question that pulls the reader in immediately. Avoid starting with 'I have always wanted to be a lawyer.'", "Body: 2-3 experiences or themes that reveal who you are and why law. Connect each to your legal aspirations.", "Why Law: Make the connection explicit -- what specifically draws you to the legal profession and not another path?", "Closing: Forward-looking. What kind of lawyer do you intend to be? What impact do you intend to have?"] },
        { heading: "Common Personal Statement Mistakes", bullets: ["Summarizing your resume -- the committee can read your resume", "Being too safe -- a forgettable statement is a wasted opportunity", "Writing what you think they want to hear rather than your actual story", "Ignoring the prompt if a school gives a specific one", "Exceeding the page limit -- most schools mean it"] },
        { heading: "The Revision Process", body: "Plan for at least four to six drafts. Write a rough first draft without editing. Let it sit for two days. Revise for story and structure. Get feedback from someone who will be honest -- not just encouraging. Revise again for language and precision. Read it aloud to catch awkward phrasing. Have at least one pre-law advisor or professor review the final draft." },
        { heading: "Length and Format", body: "Most schools ask for 2-3 pages double spaced, which is approximately 700-900 words. Use a standard readable font like Times New Roman or Garamond at 12pt with one-inch margins. Do not include headers, your name, or page numbers unless specifically requested. Every word should earn its place." }
      ]},
      { id: "adm-t14", title: "T14 Admissions Stats", icon: "T14", summary: "Median LSAT and GPA data for the top 14 law schools", sections: [
        { heading: "What Is the T14?", body: "The T14 refers to the fourteen law schools that have consistently ranked at the top of the US News and World Report rankings. These schools carry significant prestige, produce a disproportionate share of federal clerks, BigLaw partners, and government officials, and offer the strongest alumni networks in the legal profession." },
        { heading: "T14 Median LSAT and GPA", bullets: ["Yale Law School -- Median LSAT: 174, Median GPA: 3.93", "Harvard Law School -- Median LSAT: 174, Median GPA: 3.92", "Stanford Law School -- Median LSAT: 174, Median GPA: 3.93", "Columbia Law School -- Median LSAT: 174, Median GPA: 3.90", "University of Chicago Law School -- Median LSAT: 173, Median GPA: 3.92", "NYU School of Law -- Median LSAT: 174, Median GPA: 3.87", "University of Pennsylvania Carey Law School -- Median LSAT: 172, Median GPA: 3.90", "University of Michigan Law School -- Median LSAT: 171, Median GPA: 3.85", "UC Berkeley School of Law -- Median LSAT: 171, Median GPA: 3.82", "Duke University School of Law -- Median LSAT: 171, Median GPA: 3.87", "Northwestern Pritzker School of Law -- Median LSAT: 171, Median GPA: 3.85", "Cornell Law School -- Median LSAT: 170, Median GPA: 3.80", "Georgetown University Law Center -- Median LSAT: 168, Median GPA: 3.80", "University of Texas School of Law -- Median LSAT: 170, Median GPA: 3.83"] },
        { heading: "Understanding Your Chances", body: "These medians mean that roughly half of admitted students scored at or above this number. Being at or above both medians makes you a competitive applicant. Being significantly below both medians makes admission unlikely regardless of other factors. Being strong on one and weak on the other -- called a splitter -- makes your application harder to predict and requires an especially strong application." },
        { heading: "Beyond the Numbers", body: "Top schools routinely reject applicants with 175 LSAT scores and 4.0 GPAs. What distinguishes accepted applicants includes extraordinary professional or academic achievement, compelling personal narratives, demonstrated commitment to a specific area of law, public interest backgrounds, and underrepresented perspectives. The higher you aim, the more your personal statement and resume need to work." },
        { heading: "Scholarship Considerations", body: "Full scholarship offers at lower-ranked schools versus debt at a T14 is one of the most common and difficult decisions in law school admissions. Consider your intended career: BigLaw or federal clerkships often require T14 credentials. Public interest, government, or regional practice may not. The debt-to-income ratio of your intended career should drive this decision, not prestige alone." }
      ]},
      { id: "adm-extracurriculars", title: "Clubs and Extracurriculars That Help", icon: "Club", summary: "Activities that strengthen your application and prepare you for law", sections: [
        { heading: "Why Extracurriculars Matter", body: "Law schools want to admit people who will contribute to their community and become active members of the legal profession. Sustained, meaningful involvement in a few activities is far more impressive than a long list of shallow memberships. Leadership roles and demonstrated impact matter most." },
        { heading: "High-Impact Activities for Pre-Law Students", bullets: ["Mock Trial -- the single most directly relevant activity; competing or leading a team demonstrates advocacy, quick thinking, and legal reasoning under pressure", "Moot Court -- if available at your university, appellate advocacy experience is highly valued", "Debate or Model United Nations -- both demonstrate argumentation, research, and public speaking", "Law Review or Legal Journal -- at the undergraduate level, publishing or editing research demonstrates scholarly ability", "Pre-Law Society -- leadership roles show organizational ability and genuine interest in the legal community"] },
        { heading: "Community and Public Service", bullets: ["Legal aid volunteering -- working at a legal aid clinic, public defender office, or courthouse demonstrates real exposure to the legal system", "ACLU, NAACP, or advocacy organizations -- involvement in civil rights or social justice work is particularly valued at schools with strong public interest missions", "Policy internships -- working for a legislator, government agency, or think tank shows interest in law's intersection with policy", "Community organizing -- demonstrated impact in your community tells a compelling story of leadership and values"] },
        { heading: "Research and Academic Activities", bullets: ["Research assistant to a law professor -- this provides direct mentorship, a strong recommendation letter, and academic legal experience", "Undergraduate research or thesis -- independent scholarly work demonstrates the analytical skills law school demands", "Writing for campus publications -- strong writing is foundational to legal practice; a portfolio of published work helps", "Phi Beta Kappa or other academic honor societies -- signals academic distinction"] },
        { heading: "Work Experience That Stands Out", bullets: ["Paralegal or legal assistant positions -- direct legal work experience is highly valued, especially at schools that prioritize professional applicants", "Judicial internships or clerkships -- even at the trial court level, courthouse experience is distinctive", "Business, consulting, or finance -- demonstrates analytical skills and professional maturity", "Military service -- schools actively recruit veterans for the leadership, discipline, and unique perspective they bring"] },
        { heading: "A Note on Timing", body: "You do not need to do everything on this list. Choose two or three activities you genuinely care about and go deep rather than wide. Admissions committees can tell the difference between authentic engagement and resume padding. The best extracurricular is one that generates a compelling story you can tell in your personal statement." }
      ]},
      { id: "adm-letters", title: "Letters of Recommendation", icon: "LOR", summary: "How to get strong letters that actually help your application", sections: [
        { heading: "Who Should Write Your Letters", body: "Most schools require two letters and accept three. Academic letters from professors who know your work in detail are typically strongest. Professional letters from supervisors who can speak to your analytical ability, work ethic, and character are valuable, especially for applicants who have been out of school for several years. Avoid letters from family friends, politicians, or anyone who cannot speak specifically and credibly to your abilities." },
        { heading: "How to Ask", bullets: ["Ask at least 2-3 months before your intended submission date", "Ask in person or by video call -- not by email alone", "Bring your resume, personal statement draft, and a brief explanation of why you want to go to law school", "Ask directly: 'Do you feel you know my work well enough to write me a strong letter?' This gives them an easy exit if they cannot", "Follow up with a formal email summarizing your conversation and attaching your materials"] },
        { heading: "What Makes a Strong Letter", body: "The best letters are specific, narrative, and enthusiastic. A letter that says 'Jane was an excellent student who received an A in my class' is nearly worthless. A letter that recounts a specific moment -- a paper that challenged the professor's own thinking, a research contribution that advanced the lab's work -- is genuinely valuable. Provide your recommenders with everything they need to write this kind of letter." },
        { heading: "Waiving Your Right to See the Letter", body: "Always waive your right to see your letters of recommendation. Failing to do so signals insecurity and undermines the letter's credibility in the eyes of admissions committees. You are trusting your recommender to advocate for you -- choose someone you trust and give them the material they need to do it well." }
      ]},
      { id: "adm-timeline", title: "Application Strategy and Timeline", icon: "Plan", summary: "When to apply, where to apply, and how to build your school list", sections: [
        { heading: "Building Your School List", body: "A well-constructed list includes reach schools where you are below the median, target schools where you are at or near the median, and safety schools where you are comfortably above. Most applicants apply to 8-15 schools. Applying to fewer than six schools is risky. Research each school's culture, specializations, clinic offerings, and employment outcomes -- not just its ranking." },
        { heading: "Early Decision and Early Action", body: "Several T14 schools offer binding Early Decision programs that can meaningfully increase your admission chances -- some schools report acceptance rates two to three times higher for ED applicants. Only apply ED if you are certain that school is your first choice and you do not need to compare financial aid offers, since you are committing to attend if admitted." },
        { heading: "When to Apply", bullets: ["September 1 -- most schools open their applications; submit as soon as yours is polished", "October -- ideal window for competitive applicants applying to T14 schools", "November-December -- still competitive for most schools", "January -- late but still viable for schools outside the T14", "February and beyond -- rolling admissions means seats fill up; avoid this range if possible"] },
        { heading: "Retaking the LSAT", body: "Most schools consider your highest LSAT score, and some average scores. If your score is significantly below a school's median, retaking is worth serious consideration. The LSAT can be taken up to three times per testing year. Improvement of even three to five points can dramatically change your admissions outcomes at the top schools." },
        { heading: "Deferrals and Gap Years", body: "Many accepted students choose to defer admission for one year to gain work experience, save money, or complete other commitments. Most schools allow a one-year deferral with a compelling reason. A gap year doing legal work, service, or other meaningful activity can strengthen your profile and give you more to contribute in class." }
      ]}
    ]
  }
};

export default function SpecterLSATApp() {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [showTerms, setShowTerms] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showHome, setShowHome] = useState(true);
  const [section, setSection] = useState(null);
  const [testIdx, setTestIdx] = useState(null);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showRes, setShowRes] = useState(false);
  const [selAns, setSelAns] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAccess, setShowAccess] = useState(false);
  const [completed, setCompleted] = useState({});
  const [showLearn, setShowLearn] = useState(false);
  const [learnSec, setLearnSec] = useState(null);
  const [learnArt, setLearnArt] = useState(null);
  const [showAccount, setShowAccount] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);
  const [explainFilter, setExplainFilter] = useState('all');
  const [drillMissed, setDrillMissed] = useState([]);
  const [expandedQ, setExpandedQ] = useState(null);
  const [testHistory, setTestHistory] = useState({});
  const [showDrill, setShowDrill] = useState(false);
  const [drillType, setDrillType] = useState(null); // 'lr' | 'rc' | 'mixed'
  const [drillQ, setDrillQ] = useState(null);
  const [drillSel, setDrillSel] = useState(null);
  const [drillShowRes, setDrillShowRes] = useState(false);
  const [drillScore, setDrillScore] = useState({ correct: 0, total: 0 });
  const [drillHistory, setDrillHistory] = useState([]);
  const [tActive, setTActive] = useState(false);
  const [tDone, setTDone] = useState(false);
  const [tParts, setTParts] = useState([]);
  const [tPartIdx, setTPartIdx] = useState(0);
  const [tAnswers, setTAnswers] = useState({});
  const [tQ, setTQ] = useState(0);
  const [tSel, setTSel] = useState(null);
  const [tShowRes, setTShowRes] = useState(false);
  const [tTime, setTTime] = useState(35 * 60);
  const [tScores, setTScores] = useState([]);

  useEffect(() => {
    ls.get("su").then(r => {
      if (r && r.value) {
        const u = JSON.parse(r.value);
        setUser(u); setShowHome(false);
        ls.get("ct_" + u.username).then(t => { if (t && t.value) setCompleted(JSON.parse(t.value)); }).catch(() => {});
        ls.get("th_" + u.username).then(t => { if (t && t.value) setTestHistory(JSON.parse(t.value)); }).catch(() => {});
        ls.get("dm_" + u.username).then(t => { if (t && t.value) setDrillMissed(JSON.parse(t.value)); }).catch(() => {});
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (user && Object.keys(completed).length > 0) ls.set("ct_" + user.username, JSON.stringify(completed)).catch(() => {});
  }, [completed, user]);
  useEffect(() => {
    if (user && Object.keys(testHistory).length > 0) ls.set("th_" + user.username, JSON.stringify(testHistory)).catch(() => {});
  }, [testHistory, user]);
  useEffect(() => {
    if (user && drillMissed.length > 0) ls.set("dm_" + user.username, JSON.stringify(drillMissed)).catch(() => {});
  }, [completed, user]);

  useEffect(() => {
    if (!tActive || tDone) return;
    const iv = setInterval(() => setTTime(t => t <= 1 ? 0 : t - 1), 1000);
    return () => clearInterval(iv);
  }, [tActive, tPartIdx, tDone]);

  useEffect(() => { if (tActive && tTime === 0 && !tDone) doAdvance(); }, [tTime]);

  const canAccess = user && (user.isAdmin || user.isPremium || user.hasTestAccess);

  const getQs = (type, idx) => (type === "lr" ? ALL_LR : ALL_RC).slice(idx * 26, idx * 26 + 26);

  const doLogin = async () => {
    const username = form.username.trim();
    const password = form.password;
    if (!username || !password) return alert("Please fill in all fields");
    if (username === "admin1" && password === "Leroybrown") {
      const u = { username: "admin1", email: "admin@specterlsat.com", isPremium: true, hasTestAccess: true, isAdmin: true, createdAt: new Date().toISOString() };
      try { await ls.set("su", JSON.stringify(u)); } catch(e) {}
      setUser(u); setShowHome(false); setForm({ username: "", email: "", password: "" }); return;
    }
    if (username === "influencer1" && password === "influencerpass1") {
      const u = { username: "influencer1", email: "influencer@specterlsat.com", isPremium: true, hasTestAccess: true, isAdmin: true, createdAt: new Date().toISOString() };
      try { await ls.set("su", JSON.stringify(u)); } catch(e) {}
      setUser(u); setShowHome(false); setForm({ username: "", email: "", password: "" }); return;
    }
    if (username === "Admin" && password === "Leroybrown22!") {
      const u = { username: "Admin", email: "admin@specterlsat.com", isPremium: true, hasTestAccess: true, isAdmin: true, createdAt: new Date().toISOString() };
      try { await ls.set("su", JSON.stringify(u)); } catch(e) {}
      setUser(u); setShowHome(false); setForm({ username: "", email: "", password: "" }); return;
    }
    try {
      const r = await ls.get("u_" + username);
      if (!r || !r.value) return alert("User not found. Please sign up first.");
      const u = JSON.parse(r.value);
      if (u.password !== password) return alert("Incorrect password");
      try { await ls.set("su", JSON.stringify(u)); } catch(e) {}
      try { const t = await ls.get("ct_" + u.username); if (t && t.value) setCompleted(JSON.parse(t.value)); } catch (e) {}
      try { const t = await ls.get("th_" + u.username); if (t && t.value) setTestHistory(JSON.parse(t.value)); } catch (e) {}
      setUser(u); setShowHome(false); setForm({ username: "", email: "", password: "" });
    } catch (e) { alert("Error logging in. Please try again."); }
  };

  const doSignUp = async () => {
    if (!form.username || !form.email || !form.password) return alert("Please fill in all fields");
    try {
      try { const ex = await ls.get("u_" + form.username); if (ex && ex.value) return alert("Username already exists."); } catch (e) {}
      const u = { username: form.username, email: form.email, password: form.password, isPremium: false, hasTestAccess: false, createdAt: new Date().toISOString() };
      await ls.set("u_" + form.username, JSON.stringify(u));
      setForm({ username: "", email: "", password: "" }); setIsLogin(true); alert("Account created! Please login.");
    } catch (e) { alert("Error creating account. Please try again."); }
  };

  const doLogout = async () => {
    try { await ls.delete("su"); } catch (e) {}
    setUser(null); setSection(null); setTestIdx(null); setQIdx(0); setAnswers({}); setShowRes(false); setSelAns(null); setCompleted({}); setTestHistory({}); setDrillMissed([]);
  };

  const upgrade = (premium) => {
    const url = premium
      ? 'https://buy.stripe.com/6oU6oAfj27c0367g1N7EQ05'
      : 'https://buy.stripe.com/dRm5kw6MweEs9uv2aX7EQ01';
    window.open(url, '_blank');
  };

  const startTimed = () => {
    const lr1 = Math.floor(Math.random() * 50); let lr2 = Math.floor(Math.random() * 50);
    while (lr2 === lr1) lr2 = Math.floor(Math.random() * 50);
    const rc1 = Math.floor(Math.random() * 50);
    setTParts([{ type: "lr", idx: lr1, label: "Logical Reasoning I" }, { type: "lr", idx: lr2, label: "Logical Reasoning II" }, { type: "rc", idx: rc1, label: "Reading Comprehension" }]);
    setTPartIdx(0); setTAnswers({}); setTQ(0); setTSel(null); setTShowRes(false); setTTime(35 * 60); setTDone(false); setTScores([]); setTActive(true);
  };

  const doAdvance = () => {
    const qs = tParts[tPartIdx] ? getQs(tParts[tPartIdx].type, tParts[tPartIdx].idx) : [];
    const correct = Object.keys(tAnswers).filter(k => tAnswers[k] === qs[+k]?.correct).length;
    const ns = [...tScores, { part: tParts[tPartIdx]?.label, correct, total: qs.length }];
    setTScores(ns);
    if (tPartIdx >= tParts.length - 1) { setTDone(true); setTActive(false); }
    else { setTPartIdx(i => i + 1); setTAnswers({}); setTQ(0); setTSel(null); setTShowRes(false); setTTime(35 * 60); }
  };

  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const Suit = ({ size = 10 }) => (
    <svg className={`w-${size} h-${size}`} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="9" r="6" fill="#1a1a1a" />
      <path d="M8 38 C8 26 12 22 20 22 C28 22 32 26 32 38 Z" fill="#1a1a1a" />
      <rect x="12" y="22" width="4" height="12" fill="#111" />
      <rect x="24" y="22" width="4" height="12" fill="#111" />
      <rect x="14" y="22" width="12" height="2" fill="#1a1a1a" />
      <polygon points="20,24 17,30 23,30" fill="white" />
      <rect x="19" y="26" width="2" height="6" fill="white" />
    </svg>
  );

  // HOME
  if (showHome && !user) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md"><div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center h-16 md:h-20"><div className="flex items-center gap-2 md:gap-3"><Suit /><span className="text-base md:text-xl font-bold text-gray-800">Specter LSAT Prep</span></div><div className="flex items-center gap-1 md:gap-3"><button onClick={() => setShowPricing(true)} className="text-indigo-600 font-semibold hover:text-indigo-800 px-2 md:px-4 py-2 text-sm md:text-base">Pricing</button><button onClick={() => setShowContact(true)} className="text-indigo-600 font-semibold hover:text-indigo-800 px-2 md:px-4 py-2 text-sm md:text-base">Contact</button><button onClick={() => setShowHome(false)} className="bg-indigo-600 text-white px-4 md:px-8 py-2 md:py-3 rounded-lg text-sm md:text-base font-semibold hover:bg-indigo-700">Get Started</button></div></div></nav>
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">Master the LSAT with Confidence</h1>
          <p className="text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">Comprehensive practice materials designed for success</p>
          <button onClick={() => setShowHome(false)} className="bg-indigo-600 text-white px-12 py-4 rounded-lg font-bold text-xl hover:bg-indigo-700 shadow-xl">Start Practicing Now</button>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[{n:"2600",l:"Practice Questions",d:"Comprehensive LR and RC coverage"},{n:"100",l:"Full Practice Tests",d:"Timed practice exams per section"},{n:"100%",l:"Detailed Explanations",d:"Learn from every mistake"}].map((s,i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-8 text-center"><div className="text-5xl font-bold text-indigo-600 mb-2">{s.n}</div><div className="text-xl font-semibold text-gray-800 mb-2">{s.l}</div><p className="text-gray-600">{s.d}</p></div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-12 mb-16">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Why Choose Specter LSAT Prep?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[{I:Brain,t:"Expert-Crafted Questions",d:"Every question mirrors the style and difficulty of actual LSAT questions."},{I:BookOpen,t:"Comprehensive Coverage",d:"1,300 questions per section in manageable 26-question practice tests."},{I:CheckCircle,t:"Instant Feedback",d:"Get immediate results after each question to track your progress."},{I:Crown,t:"Premium Explanations",d:"Understand why correct answers are right and wrong answers are wrong."},{I:BookOpen,t:"Free Learn Section",d:"25 in-depth strategy articles covering every question type. Free for all users.",b:"Free"},{I:List,t:"Timed Full LSAT",d:"Full timed exam with two LR sections and one RC section, 35 min each.",b:"Premium"},{I:CheckCircle,t:"Drill Mode",d:"Unlimited random questions from the full bank. Track your accuracy in real time. Free for all users -- premium users unlock detailed explanations after every question.",b:"Free"}].map(({I,t,d,b},i) => (
              <div key={i} className="flex gap-4"><div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0"><I className="w-6 h-6 text-indigo-600" /></div><div><h3 className="text-lg font-bold text-gray-900 mb-1">{t}{b && <span className={`text-xs font-semibold ml-2 px-2 py-0.5 rounded-full ${b==="Free"?"bg-emerald-100 text-emerald-600":"bg-purple-100 text-purple-600"}`}>{b}</span>}</h3><p className="text-gray-600 text-sm">{d}</p></div></div>
            ))}
          </div>
        </div>
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-10">Affordable, Effective Preparation</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200"><h3 className="text-2xl font-bold text-gray-900 mb-3">Test Access</h3><div className="mb-4"><span className="text-5xl font-bold">$35</span><span className="text-xl text-gray-500">/month</span></div>{["All 2,600 questions","100 practice tests","Instant score feedback"].map((x,i)=><div key={i} className="flex items-center gap-2 text-gray-700 mb-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0"/>{x}</div>)}</div>
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white relative"><div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 text-sm px-4 py-1 rounded-full font-bold">BEST VALUE</div><h3 className="text-2xl font-bold mb-3">Premium Access</h3><div className="mb-4"><span className="text-5xl font-bold">$45</span><span className="text-xl opacity-90">/month</span></div>{["Everything in Test Access","Detailed answer explanations","Learn from every mistake"].map((x,i)=><div key={i} className="flex items-center gap-2 mb-2"><CheckCircle className="w-5 h-5 text-yellow-300 flex-shrink-0"/>{x}</div>)}</div>
          </div>
        </div>
      </div>
      <footer className="bg-gray-900 text-white py-10"><div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4"><div className="flex items-center gap-3"><Suit size={8}/><span className="text-2xl font-bold">Specter LSAT Prep</span></div><div className="flex items-center gap-6"><button onClick={() => setShowContact(true)} className="text-gray-400 hover:text-white">Contact Us</button><button onClick={() => setShowTerms(true)} className="text-gray-400 hover:text-white">Terms of Service</button></div></div><p className="text-center text-gray-500 text-sm mt-6">2026 Specter LSAT Prep. LSAT is a registered trademark of LSAC. Not affiliated with LSAC.</p></footer>
      {showPricing && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 md:p-10 shadow-2xl my-4 md:my-8">
            <div className="flex justify-between items-center mb-6 md:mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
                <p className="text-gray-500 mt-1 text-sm md:text-base">Choose the plan that fits your preparation goals</p>
              </div>
              <button onClick={() => setShowPricing(false)} className="text-gray-400 hover:text-gray-600 text-3xl font-bold leading-none ml-4">x</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
              <div className="border-2 border-gray-200 rounded-2xl p-6 md:p-8 hover:border-indigo-300 transition-all">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Test Access</h3>
                <div className="mb-4 md:mb-6"><span className="text-5xl md:text-6xl font-bold text-gray-900">$35</span><span className="text-xl text-gray-500">/month</span></div>
                <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">Everything you need to practice at full volume with real exam conditions.</p>
                <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                  {[["2,600 total practice questions","1,300 per section across LR and RC"],["100 full practice tests","50 per section, 26 questions each"],["Randomized answer positions","No predictable patterns"],["Timed Full Test mode","Simulate real LSAT with auto-advancing sections"],["Instant score feedback","See your results after every question"],["Free Learn section","25 in-depth strategy articles included"],["Drill Mode access","Unlimited random questions -- track your accuracy live"]].map(([title, desc], i) => (
                    <li key={i} className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div><p className="font-semibold text-gray-800 text-sm md:text-base">{title}</p><p className="text-xs md:text-sm text-gray-500">{desc}</p></div>
                    </li>
                  ))}
                  <li className="flex gap-3"><XCircle className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" /><div><p className="font-semibold text-gray-400 text-sm md:text-base">No answer explanations</p><p className="text-xs md:text-sm text-gray-400">Upgrade to Premium to unlock</p></div></li>
                </ul>
                <a href="https://buy.stripe.com/dRm5kw6MweEs9uv2aX7EQ01" target="_blank" rel="noopener noreferrer" className="w-full bg-gray-900 text-white py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:bg-gray-800 transition-all block text-center">Get Test Access</a>
              </div>
              <div className="border-2 border-indigo-500 rounded-2xl p-6 md:p-8 bg-gradient-to-br from-indigo-50 to-purple-50 relative mt-4 md:mt-0">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-1.5 rounded-full text-sm font-bold">BEST VALUE</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Access</h3>
                <div className="mb-4 md:mb-6"><span className="text-5xl md:text-6xl font-bold text-gray-900">$45</span><span className="text-xl text-gray-500">/month</span></div>
                <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">Everything in Test Access, plus the explanations that accelerate your learning.</p>
                <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                  {[["Everything in Test Access","All 2,600 questions and 100 practice tests"],["Drill Mode with full explanations","See why each answer is right or wrong after every drill question"],["Detailed correct answer explanations","Understand exactly why each answer is right"],["Detailed wrong answer explanations","Learn from every mistake you make"],["Unlocked after test completion","Complete a test to access its explanations"],["Faster score improvement","Students with explanations improve 2x faster"]].map(([title, desc], i) => (
                    <li key={i} className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <div><p className="font-semibold text-gray-800 text-sm md:text-base">{title}</p><p className="text-xs md:text-sm text-gray-500">{desc}</p></div>
                    </li>
                  ))}
                </ul>
                <a href="https://buy.stripe.com/6oU6oAfj27c0367g1N7EQ05" target="_blank" rel="noopener noreferrer" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:from-indigo-700 hover:to-purple-700 transition-all block text-center">Get Premium Access</a>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 md:p-6 text-center mb-4">
              <p className="text-gray-600 text-sm"><span className="font-semibold">Not sure which plan to choose?</span> Start with Test Access and upgrade to Premium any time. Both plans include the free Learn section with 25 strategy articles.</p>
              <p className="text-gray-400 text-xs mt-2">No refunds are provided. Cancel anytime to stop future charges. Governed by the laws of Florida, USA.</p>
            </div>
            <button onClick={() => { setShowPricing(false); }} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all">Back to Home</button>
          </div>
        </div>
      )}
      {showContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Contact Us</h2>
              <button onClick={() => setShowContact(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none">x</button>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Phone</p>
                  <a href="tel:9044828164" className="text-lg font-bold text-gray-800 hover:text-indigo-600">(904) 482-8164</a>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">TikTok</p>
                  <a href="https://www.tiktok.com/@specterlsatprep" target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-gray-800 hover:text-pink-600">@specterlsatprep</a>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Email</p>
                  <a href="mailto:specterlsatprep@gmail.com" className="text-lg font-bold text-gray-800 hover:text-indigo-600">specterlsatprep@gmail.com</a>
                </div>
              </div>
            </div>
            <button onClick={() => setShowContact(false)} className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700">Close</button>
          </div>
        </div>
      )}
      {showTerms && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl"><h2 className="text-2xl font-bold mb-4">Terms of Service</h2><div className="text-sm text-gray-700 space-y-3 max-h-64 overflow-y-auto"><p><strong>1.</strong> By using Specter LSAT Prep, you agree to these Terms.</p><p><strong>2.</strong> Test Access ($35/mo): all questions and tests. Premium ($45/mo): adds detailed explanations.</p><p><strong>3. NO REFUNDS ARE PROVIDED.</strong></p><p><strong>4.</strong> Governed by laws of Florida, USA.</p><p><strong>5.</strong> specterlsatprep@gmail.com</p></div><button onClick={()=>setShowTerms(false)} className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700">Close</button></div></div>}
    </div>
  );

  // AUTH
  if (!user) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <button onClick={() => setShowHome(true)} className="text-indigo-600 hover:text-indigo-800 mb-4 text-sm">Back to Home</button>
        <div className="text-center mb-8"><h1 className="text-3xl font-bold text-gray-800 mb-2">Specter LSAT Prep</h1><p className="text-gray-600">Take the first step towards mastering your LSAT</p></div>
        <div className="flex gap-2 mb-6">{["Login","Sign Up"].map((l,i)=><button key={i} onClick={()=>setIsLogin(i===0)} className={`flex-1 py-2 rounded-lg font-semibold ${(i===0)===isLogin?"bg-indigo-600 text-white":"bg-gray-100 text-gray-600"}`}>{l}</button>)}</div>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Username</label><input type="text" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Enter username"/></div>
          {!isLogin && <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Enter email"/></div>}
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Enter password"/></div>
          <button onClick={isLogin?doLogin:doSignUp} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 flex items-center justify-center gap-2">{isLogin?<><LogIn className="w-5 h-5"/>Login</>:<><UserPlus className="w-5 h-5"/>Sign Up</>}</button>
        </div>
        <div className="mt-4 text-center text-sm text-gray-600">{isLogin?"Don't have an account?":"Already have an account?"}<button onClick={()=>setIsLogin(!isLogin)} className="text-indigo-600 font-semibold ml-1">{isLogin?"Sign up":"Login"}</button></div>
        <div className="mt-3 text-center"><button onClick={()=>setShowTerms(true)} className="text-xs text-gray-500 underline">Terms of Service</button></div>
      </div>
    </div>
  );

  // LEARN
  if (showLearn) {
    if (learnArt && learnSec) {
      const sec = LEARN[learnSec]; const art = sec.articles.find(a=>a.id===learnArt); const arts = sec.articles; const idx = arts.findIndex(a=>a.id===learnArt);
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            <button onClick={()=>setLearnArt(null)} className="text-indigo-600 hover:text-indigo-800 mb-6 font-medium">Back to {sec.title}</button>
            <div className={`${sec.color} rounded-2xl p-6 mb-6 text-white`}><div className="bg-white bg-opacity-20 inline-block rounded-lg px-3 py-1 text-sm font-bold mb-3">{art.icon}</div><h1 className="text-2xl font-bold mb-2">{art.title}</h1><p className="opacity-90 text-sm">{art.summary}</p></div>
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              {art.sections.map((s,i)=>(
                <div key={i}><h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3 pb-2 border-b-2 border-indigo-100">{s.heading}</h2>{s.body&&<p className="text-gray-700 leading-relaxed">{s.body}</p>}{s.bullets&&<ul className="space-y-2 mt-2">{s.bullets.map((b,j)=><li key={j} className="flex gap-3 text-gray-700"><span className="text-indigo-500 font-bold flex-shrink-0">-</span><span>{b}</span></li>)}</ul>}</div>
              ))}
            </div>
            <div className="mt-6 flex gap-3">{idx>0&&<button onClick={()=>setLearnArt(arts[idx-1].id)} className="flex-1 bg-white text-indigo-600 border-2 border-indigo-300 py-3 rounded-xl font-semibold hover:bg-indigo-50">Previous Article</button>}{idx<arts.length-1&&<button onClick={()=>setLearnArt(arts[idx+1].id)} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700">Next Article</button>}</div>
          </div>
        </div>
      );
    }
    if (learnSec) {
      const sec = LEARN[learnSec];
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            <button onClick={()=>setLearnSec(null)} className="text-indigo-600 hover:text-indigo-800 mb-6 font-medium">Back to Learn</button>
            <div className={`${sec.color} rounded-2xl p-8 mb-8 text-white`}><h1 className="text-3xl font-bold mb-4">{sec.title}</h1>{sec.overview.map((p,i)=><p key={i} className="opacity-90 text-sm mb-3 leading-relaxed">{p}</p>)}</div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Articles</h2>
            <div className="space-y-3">{sec.articles.map(art=>(
              <button key={art.id} onClick={()=>setLearnArt(art.id)} className="w-full bg-white rounded-xl shadow p-5 hover:shadow-lg hover:bg-indigo-50 border-2 border-transparent hover:border-indigo-200 flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0"><span className="text-xs font-bold text-indigo-600">{art.icon}</span></div>
                <div className="flex-1"><h3 className="font-bold text-gray-800 mb-1">{art.title}</h3><p className="text-sm text-gray-500">{art.summary}</p></div>
                <ChevronRight className="w-5 h-5 text-indigo-400 flex-shrink-0"/>
              </button>
            ))}</div>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <button onClick={()=>setShowLearn(false)} className="text-indigo-600 hover:text-indigo-800 mb-6 font-medium">Back to Dashboard</button>
          <div className="text-center mb-10"><h1 className="text-4xl font-bold text-gray-800 mb-3">Learn</h1><p className="text-gray-600 text-lg">Master every question type with in-depth strategy guides</p></div>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <button onClick={()=>setLearnSec("lr")} className="bg-indigo-600 rounded-2xl p-8 text-white text-left hover:bg-indigo-700"><div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-4"><Brain className="w-6 h-6 text-white"/></div><h2 className="text-2xl font-bold mb-2">Logical Reasoning</h2><p className="text-indigo-200 text-sm mb-3">Master all 9 LR question types with attack strategies, examples, and key tips</p><div className="text-indigo-300 text-sm font-semibold">{LEARN.lr.articles.length} articles</div></button>
            <button onClick={()=>setLearnSec("rc")} className="bg-purple-600 rounded-2xl p-8 text-white text-left hover:bg-purple-700"><div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-4"><BookOpen className="w-6 h-6 text-white"/></div><h2 className="text-2xl font-bold mb-2">Reading Comprehension</h2><p className="text-purple-200 text-sm mb-3">Master all 7 RC question types with active reading strategies and examples</p><div className="text-purple-300 text-sm font-semibold">{LEARN.rc.articles.length} articles</div></button>
          </div>
          <button onClick={()=>setLearnSec("lsat")} className="w-full bg-emerald-600 rounded-2xl p-8 text-white text-left hover:bg-emerald-700 mb-6"><div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-4"><List className="w-6 h-6 text-white"/></div><h2 className="text-2xl font-bold mb-2">The LSAT Structure</h2><p className="text-emerald-200 text-sm mb-3">How the test is built, timing strategies, and test day prep</p><div className="text-emerald-300 text-sm font-semibold">{LEARN.lsat.articles.length} articles</div></button>
          <button onClick={()=>setLearnSec("admissions")} className="w-full bg-rose-600 rounded-2xl p-8 text-white text-left hover:bg-rose-700 mb-6"><div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-4"><Crown className="w-6 h-6 text-white"/></div><h2 className="text-2xl font-bold mb-2">Law School Admissions</h2><p className="text-rose-200 text-sm mb-3">Personal statements, T14 stats, extracurriculars, letters of rec, and application strategy</p><div className="text-rose-300 text-sm font-semibold">{LEARN.admissions.articles.length} articles</div></button>
          <div className="bg-white rounded-2xl shadow p-6"><h3 className="font-bold text-gray-800 mb-2">How to use the Learn section</h3><p className="text-gray-600 text-sm">Start with the section overview, then work through the articles. After reading, head to practice tests to apply what you have learned.</p></div>
        </div>
      </div>
    );
  }

  // TIMED DONE
  if (tDone) {
    const tot = tScores.reduce((a,s)=>a+s.correct,0); const totQ = tScores.reduce((a,s)=>a+s.total,0);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-lg w-full text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Full Test Complete!</h2>
          <p className="text-gray-500 mb-8">Here is how you did across all three sections</p>
          <div className="space-y-4 mb-8">
            {tScores.map((s,i)=><div key={i} className="bg-gray-50 rounded-xl p-4 flex justify-between items-center"><div className="text-left"><p className="font-semibold text-gray-800">{s.part}</p><p className="text-sm text-gray-500">{s.total} questions</p></div><div className="text-right"><p className="text-2xl font-bold text-indigo-600">{s.correct}/{s.total}</p><p className="text-sm text-gray-500">{Math.round(s.correct/s.total*100)}%</p></div></div>)}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white flex justify-between items-center"><div className="font-bold text-lg">Total Score</div><div><p className="text-2xl font-bold">{tot}/{totQ}</p><p className="text-sm opacity-80">{Math.round(tot/totQ*100)}%</p></div></div>
          </div>
          <div className="flex gap-3"><button onClick={()=>{setTDone(false);startTimed();}} className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700">Take Another</button><button onClick={()=>setTDone(false)} className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300">Back to Menu</button></div>
        </div>
      </div>
    );
  }

  // TIMED ACTIVE
  if (tActive && tParts.length > 0) {
    const part = tParts[tPartIdx]; const qs = getQs(part.type, part.idx); const q = qs[tQ];
    const isU = tTime <= 300; const isC = tTime <= 60;
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4 bg-white rounded-xl shadow px-6 py-3">
            <div><span className="font-bold text-gray-800 text-lg">{part.label}</span><span className="ml-3 text-sm text-gray-500">Section {tPartIdx+1} of {tParts.length}</span></div>
            <div className={`px-4 py-2 rounded-lg font-bold text-xl ${isC?"bg-red-600 text-white":isU?"bg-orange-100 text-orange-700":"bg-indigo-50 text-indigo-700"}`}>{fmt(tTime)}</div>
            <button onClick={doAdvance} className="text-sm text-gray-500 hover:text-red-600 font-semibold">End Section</button>
          </div>
          <div className="flex gap-2 mb-4">{tParts.map((_,i)=><div key={i} className={`h-2 rounded-full flex-1 ${i<tPartIdx?"bg-green-500":i===tPartIdx?"bg-indigo-600":"bg-gray-200"}`}/>)}</div>
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <div className="flex justify-between mb-4"><span className="text-gray-600">Question {tQ+1} of {qs.length}</span><span className="text-sm text-gray-500">{Object.keys(tAnswers).length} answered</span></div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6"><div className="bg-indigo-600 h-2 rounded-full" style={{width:`${(tQ+1)/qs.length*100}%`}}/></div>
            <div className="bg-gray-50 rounded-lg p-5 mb-5"><p className="text-gray-800 leading-relaxed">{q.passage}</p></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{q.question}</h3>
            <div className="space-y-3 mb-6">
              {q.options.map((opt,idx)=>{
                const s=tSel===idx; const c=idx===q.correct; let cls="bg-white hover:bg-gray-50 border-gray-300"; let ico=null;
                if(tShowRes){if(c){cls="bg-green-50 border-green-500";ico=<CheckCircle className="w-5 h-5 text-green-600"/>;}else if(s){cls="bg-red-50 border-red-500";ico=<XCircle className="w-5 h-5 text-red-600"/>;}}else if(s){cls="bg-indigo-50 border-indigo-500";}
                return <button key={idx} onClick={()=>{if(!tShowRes){setTSel(idx);setTAnswers(a=>({...a,[tQ]:idx}));}}} disabled={tShowRes} className={`w-full text-left p-4 rounded-lg border-2 flex items-center justify-between ${cls}`}><span className="text-gray-800">{opt}</span>{ico}</button>;
              })}
            </div>
            <div className="flex justify-between">
              <button onClick={()=>{if(tQ>0){setTQ(q=>q-1);setTSel(tAnswers[tQ-1]??null);setTShowRes(false);}}} disabled={tQ===0} className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50">Previous</button>
              <div className="flex gap-3">
                {!tShowRes&&tSel!==null&&<button onClick={()=>setTShowRes(true)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Submit Answer</button>}
                {tShowRes&&tQ<qs.length-1&&<button onClick={()=>{setTQ(q=>q+1);setTSel(tAnswers[tQ+1]??null);setTShowRes(false);}} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center">Next<ChevronRight className="w-4 h-4 ml-1"/></button>}
                {tShowRes&&tQ===qs.length-1&&<button onClick={doAdvance} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">{tPartIdx<tParts.length-1?"Next Section":"Finish Test"}</button>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DASHBOARD
  if (showExplanations) {
    const isPremium = user && (user.isPremium || user.isAdmin);

    if (!isPremium) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-10 text-center">
            <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4"/>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Premium Feature</h2>
            <p className="text-gray-600 mb-6">The Explanation Bank is available to Premium subscribers. Upgrade to review every question you got wrong with full explanations.</p>
            <button onClick={()=>upgrade(true)} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 mb-3">Upgrade to Premium -- $45/month</button>
            <button onClick={()=>setShowExplanations(false)} className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200">Back to Dashboard</button>
          </div>
        </div>
      );
    }

    const testMissed = drillMissed.filter(q => q.source === 'test');
    const drillOnlyMissed = drillMissed.filter(q => q.source === 'drill');
    const filtered = explainFilter === 'tests' ? testMissed : explainFilter === 'drill' ? drillOnlyMissed : drillMissed;

    // Group by sourceLabel
    const grouped = {};
    filtered.forEach(q => {
      if (!grouped[q.sourceLabel]) grouped[q.sourceLabel] = [];
      grouped[q.sourceLabel].push(q);
    });


    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <button onClick={()=>setShowExplanations(false)} className="text-indigo-600 hover:text-indigo-800 mb-6 flex items-center font-medium">Back to Dashboard</button>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Explanation Bank</h1>
              <p className="text-gray-500 mt-1">Every question you got wrong -- with full explanations</p>
            </div>
            <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1"><Crown className="w-4 h-4"/>Premium</span>
          </div>

          <div className="flex gap-2 mt-6 mb-6">
            {[['all','All Missed'],['tests','From Tests'],['drill','From Drill']].map(([val,label])=>(
              <button key={val} onClick={()=>setExplainFilter(val)} className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${explainFilter===val?'bg-indigo-600 text-white':'bg-white text-gray-600 hover:bg-gray-50 shadow'}`}>{label}</button>
            ))}
            <span className="ml-auto text-sm text-gray-500 flex items-center">{filtered.length} question{filtered.length!==1?'s':''} missed</span>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">{explainFilter === 'all' ? 'No missed questions yet' : 'No missed questions in this category'}</h2>
              <p className="text-gray-500 mb-6">{explainFilter === 'all' ? 'Complete practice tests or drill questions. Questions you get wrong will appear here with full explanations.' : 'Switch to a different filter or complete more questions.'}</p>
              <button onClick={()=>setShowExplanations(false)} className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700">Go Practice</button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([label, questions]) => (
                <div key={label} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className={`px-6 py-4 flex items-center justify-between ${label.includes('Logical') || label.includes('Reading') ? 'bg-indigo-600' : 'bg-orange-500'}`}>
                    <div>
                      <h2 className="text-lg font-bold text-white">{label}</h2>
                      <p className="text-white opacity-80 text-sm">{questions[0]?.date} -- {questions.length} missed question{questions.length!==1?'s':''}</p>
                    </div>
                    <span className={`text-white text-xs font-bold px-2 py-1 rounded-full ${label.includes('Test') ? 'bg-white bg-opacity-20' : 'bg-white bg-opacity-20'}`}>{label.includes('Drill') ? 'DRILL' : 'TEST'}</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {questions.map((q, qi) => (
                      <div key={qi} className="p-5">
                        <button onClick={()=>setExpandedQ(expandedQ===q.id?null:q.id)} className="w-full text-left">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <p className="text-gray-500 text-xs mb-1 font-semibold uppercase tracking-wide">Stimulus</p>
                              <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">{q.passage}</p>
                              <p className="text-gray-800 font-semibold mt-2 text-sm">{q.question}</p>
                            </div>
                            <div className={`flex-shrink-0 mt-1 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs ${expandedQ===q.id?'bg-indigo-600':'bg-gray-300'}`}>{expandedQ===q.id?'-':'+'}</div>
                          </div>
                        </button>
                        {expandedQ===q.id && (
                          <div className="mt-4 space-y-3">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="text-gray-700 text-sm leading-relaxed">{q.passage}</p>
                            </div>
                            <p className="text-gray-800 font-semibold text-sm">{q.question}</p>
                            <div className="space-y-2">
                              {q.options && q.options.map((opt, idx) => {
                                const isCorrect = idx === q.correct;
                                const isChosen = idx === q.chosen;
                                let cls = "bg-white border-gray-200";
                                if (isCorrect) cls = "bg-green-50 border-green-500";
                                else if (isChosen) cls = "bg-red-50 border-red-400";
                                return (
                                  <div key={idx} className={`p-3 rounded-lg border-2 flex items-center justify-between gap-3 ${cls}`}>
                                    <span className="text-sm text-gray-800">{opt}</span>
                                    {isCorrect && <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0"/>}
                                    {isChosen && !isCorrect && <XCircle className="w-4 h-4 text-red-500 flex-shrink-0"/>}
                                  </div>
                                );
                              })}
                            </div>
                            <div className="grid md:grid-cols-2 gap-3 mt-4">
                              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                <div className="flex items-center gap-2 mb-2"><CheckCircle className="w-4 h-4 text-green-600"/><span className="font-semibold text-green-800 text-sm">Why the correct answer is right</span></div>
                                <p className="text-gray-700 text-sm">This answer correctly identifies the core issue in the argument. It accurately reflects what the question demands without adding unsupported inferences or shifting the scope of the claim.</p>
                              </div>
                              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                                <div className="flex items-center gap-2 mb-2"><XCircle className="w-4 h-4 text-red-600"/><span className="font-semibold text-red-800 text-sm">Why your answer was wrong</span></div>
                                <p className="text-gray-700 text-sm">This answer misidentifies the key issue. While plausible, it either overstates, understates, or shifts focus away from the specific logical concern the question targets.</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showProgress) {
    const allHistory = Object.values(testHistory);
    const lrHistory = allHistory.filter(e=>e.section==='lr').sort((a,b)=>b.testNum-a.testNum);
    const rcHistory = allHistory.filter(e=>e.section==='rc').sort((a,b)=>b.testNum-a.testNum);
    const allMissed = {};
    allHistory.forEach(e=>{ Object.entries(e.missedTypes||{}).forEach(([t,c])=>{ allMissed[t]=(allMissed[t]||0)+c; }); });
    const sortedMissed = Object.entries(allMissed).sort((a,b)=>b[1]-a[1]);
    const lrAvg = lrHistory.length ? Math.round(lrHistory.reduce((a,e)=>a+e.pct,0)/lrHistory.length) : null;
    const rcAvg = rcHistory.length ? Math.round(rcHistory.reduce((a,e)=>a+e.pct,0)/rcHistory.length) : null;
    const totalTests = allHistory.length;
    const overallAvg = totalTests ? Math.round(allHistory.reduce((a,e)=>a+e.pct,0)/totalTests) : null;

    const ScoreBar = ({pct}) => (
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div className={`h-2 rounded-full ${pct>=80?'bg-green-500':pct>=60?'bg-yellow-500':'bg-red-500'}`} style={{width:`${pct}%`}}/>
        </div>
        <span className={`text-sm font-bold w-10 text-right ${pct>=80?'text-green-600':pct>=60?'text-yellow-600':'text-red-600'}`}>{pct}%</span>
      </div>
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <button onClick={()=>setShowProgress(false)} className="text-indigo-600 hover:text-indigo-800 mb-6 flex items-center font-medium">Back to Dashboard</button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Progress</h1>
          <p className="text-gray-500 mb-8">Your practice test history and performance breakdown</p>

          {totalTests === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">No data yet</h2>
              <p className="text-gray-500 mb-6">Complete a practice test and mark it as completed to start tracking your progress.</p>
              <button onClick={()=>setShowProgress(false)} className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700">Go Practice</button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {[{label:"Tests Completed",value:totalTests,sub:"total across both sections"},{label:"Overall Average",value:overallAvg!==null?overallAvg+"%":"--",sub:"across all completed tests"},{label:"Weak Areas",value:sortedMissed.length>0?sortedMissed[0][0]:"None",sub:sortedMissed.length>0?`${sortedMissed[0][1]} questions missed`:"Keep it up!"}].map((s,i)=>(
                  <div key={i} className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <div className="text-3xl font-bold text-indigo-600 mb-1">{s.value}</div>
                    <div className="font-semibold text-gray-800">{s.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{s.sub}</div>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {[{label:"Logical Reasoning",color:"bg-blue-900",history:lrHistory,avg:lrAvg},{label:"Reading Comprehension",color:"bg-red-600",history:rcHistory,avg:rcAvg}].map(({label,color,history,avg})=>(
                  <div key={label} className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-gray-800">{label}</h2>
                      {avg!==null && <span className={`text-sm font-bold px-3 py-1 rounded-full ${avg>=80?'bg-green-100 text-green-700':avg>=60?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700'}`}>Avg: {avg}%</span>}
                    </div>
                    {history.length===0 ? (
                      <p className="text-gray-400 text-sm text-center py-4">No tests completed yet</p>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                        {history.map((e,i)=>(
                          <div key={i} className="flex items-center justify-between gap-3">
                            <div className="flex-shrink-0 w-28">
                              <p className="text-sm font-semibold text-gray-800">Test {e.testNum}</p>
                              <p className="text-xs text-gray-400">{e.date}</p>
                            </div>
                            <div className="flex-1"><ScoreBar pct={e.pct}/></div>
                            <div className="flex-shrink-0 text-right">
                              <p className="text-sm font-bold text-gray-800">{e.score}/{e.total}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {sortedMissed.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                  <h2 className="text-lg font-bold text-gray-800 mb-2">Question Types Missed</h2>
                  <p className="text-sm text-gray-500 mb-5">Based on all completed tests -- focus your study on the types at the top</p>
                  <div className="space-y-4">
                    {sortedMissed.map(([type, count], i) => {
                      const maxCount = sortedMissed[0][1];
                      const pct = Math.round(count/maxCount*100);
                      return (
                        <div key={i} className="flex items-center gap-4">
                          <div className="w-36 flex-shrink-0">
                            <p className="text-sm font-semibold text-gray-800">{type}</p>
                            <p className="text-xs text-gray-400">{count} question{count!==1?"s":""} missed</p>
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div className={`h-3 rounded-full ${i===0?'bg-red-500':i===1?'bg-orange-400':i===2?'bg-yellow-400':'bg-indigo-400'}`} style={{width:`${pct}%`}}/>
                          </div>
                          <div className="w-8 text-right text-sm font-bold text-gray-600">{count}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Recommended next steps:</p>
                    <ul className="space-y-1">
                      {sortedMissed.slice(0,3).map(([type],i)=>(
                        <li key={i} className="text-sm text-gray-600 flex gap-2">
                          <span className="text-indigo-500 font-bold">-</span>
                          <span>Review the <button onClick={()=>{setShowProgress(false);setShowLearn(true);setLearnSec(type==='Main Point'||type==='Inference'||type==='Function'||type==='Author Attitude'||type==='Structure'?'rc':'lr');setLearnArt(null);}} className="text-indigo-600 font-semibold hover:underline">Learn section</button> for {type} questions</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">All Completed Tests</h2>
                {allHistory.length===0 ? <p className="text-gray-400 text-sm">No tests completed yet.</p> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="text-left text-gray-500 border-b border-gray-100"><th className="pb-3 font-semibold">Section</th><th className="pb-3 font-semibold">Test</th><th className="pb-3 font-semibold">Score</th><th className="pb-3 font-semibold">Pct</th><th className="pb-3 font-semibold">Date</th><th className="pb-3 font-semibold">Top Missed</th></tr></thead>
                      <tbody>
                        {allHistory.sort((a,b)=>new Date(b.date)-new Date(a.date)).map((e,i)=>{
                          const topMissed = Object.entries(e.missedTypes||{}).sort((a,b)=>b[1]-a[1])[0];
                          return (
                            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                              <td className="py-3"><span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${e.section==='lr'?'bg-blue-900':'bg-red-500'}`}>{e.section.toUpperCase()}</span></td>
                              <td className="py-3 font-medium text-gray-800">Test {e.testNum}</td>
                              <td className="py-3 text-gray-700">{e.score}/{e.total}</td>
                              <td className="py-3"><span className={`font-bold ${e.pct>=80?'text-green-600':e.pct>=60?'text-yellow-600':'text-red-600'}`}>{e.pct}%</span></td>
                              <td className="py-3 text-gray-500">{e.date}</td>
                              <td className="py-3 text-gray-600">{topMissed?`${topMissed[0]} (${topMissed[1]})`:"--"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (showDrill) {
    const getRandomQ = (type) => {
      const pool = type === 'lr' ? ALL_LR : type === 'rc' ? ALL_RC : Math.random() > 0.5 ? ALL_LR : ALL_RC;
      const idx = Math.floor(Math.random() * pool.length);
      return { ...pool[idx], sourceType: type === 'mixed' ? (pool === ALL_LR ? 'lr' : 'rc') : type };
    };

    const startDrill = (type) => {
      setDrillType(type);
      setDrillQ(getRandomQ(type));
      setDrillSel(null);
      setDrillShowRes(false);
    };

    const nextDrillQ = () => {
      setDrillQ(getRandomQ(drillType));
      setDrillSel(null);
      setDrillShowRes(false);
    };

    const submitDrill = () => {
      const isCorrect = drillSel === drillQ.correct;
      setDrillScore(s => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
      setDrillHistory(h => [...h, { correct: isCorrect }]);
      if (!isCorrect) {
        const missed = {
          id: Date.now() + Math.random(),
          source: 'drill',
          sourceLabel: 'Drill -- ' + (drillType === 'lr' ? 'Logical Reasoning' : drillType === 'rc' ? 'Reading Comprehension' : 'Mixed'),
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          passage: drillQ.passage,
          question: drillQ.question,
          options: drillQ.options,
          correct: drillQ.correct,
          chosen: drillSel,
        };
        setDrillMissed(prev => [missed, ...prev].slice(0, 200));
      }
      setDrillShowRes(true);
    };

    const isPremium = user && (user.isPremium || user.isAdmin);
    const pct = drillScore.total > 0 ? Math.round(drillScore.correct / drillScore.total * 100) : null;

    if (!drillType) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
            <button onClick={()=>setShowDrill(false)} className="text-indigo-600 hover:text-indigo-800 mb-6 flex items-center font-medium">Back to Dashboard</button>
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-gray-800 mb-3">Drill Mode</h1>
              <p className="text-gray-600 text-lg">Random questions from the full bank. Answer as many as you like -- no time limit, no pressure.</p>
              {!isPremium && <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mt-4 inline-block">Upgrade to Premium to unlock explanations after each question</p>}
            </div>
            <div className="grid gap-4">
              {[{type:'lr',label:'Logical Reasoning',desc:'Random LR questions from the full bank',color:'bg-blue-900'},{type:'rc',label:'Reading Comprehension',desc:'Random RC questions from the full bank',color:'bg-red-600'},{type:'mixed',label:'Mixed',desc:'Random mix of LR and RC questions',color:'bg-gradient-to-br from-purple-600 to-indigo-600'}].map(({type,label,desc,color})=>(
                <button key={type} onClick={()=>startDrill(type)} className={`${color} rounded-2xl p-8 text-white text-left hover:opacity-90 transition-all shadow-lg`}>
                  <h2 className="text-2xl font-bold mb-2">{label}</h2>
                  <p className="text-white opacity-80 text-sm">{desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={()=>{setDrillType(null);setDrillQ(null);setDrillSel(null);setDrillShowRes(false);}} className="text-indigo-600 hover:text-indigo-800 font-medium">Back to Drill Menu</button>
            {drillScore.total > 0 && (
              <div className="flex items-center gap-4 bg-white rounded-xl shadow px-5 py-2">
                <span className="text-sm text-gray-500">{drillScore.total} answered</span>
                <span className={`text-sm font-bold ${pct >= 70 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{pct}% correct</span>
                <div className="flex gap-1">
                  {drillHistory.slice(-10).map((h,i) => <div key={i} className={`w-3 h-3 rounded-full ${h.correct ? 'bg-green-500' : 'bg-red-400'}`}/>)}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs font-bold px-3 py-1 rounded-full text-white ${drillQ.sourceType === 'lr' ? 'bg-blue-900' : 'bg-red-600'}`}>{drillQ.sourceType === 'lr' ? 'Logical Reasoning' : 'Reading Comprehension'}</span>
              <span className="text-sm text-gray-400">Question {drillScore.total + (drillShowRes ? 0 : 1)}</span>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 mb-5"><p className="text-gray-800 leading-relaxed">{drillQ.passage}</p></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{drillQ.question}</h3>

            <div className="space-y-3 mb-6">
              {drillQ.options.map((opt, idx) => {
                const sel = drillSel === idx; const cor = idx === drillQ.correct;
                let cls = "bg-white hover:bg-gray-50 border-gray-300"; let icon = null;
                if (drillShowRes) {
                  if (cor) { cls = "bg-green-50 border-green-500"; icon = <CheckCircle className="w-5 h-5 text-green-600"/>; }
                  else if (sel) { cls = "bg-red-50 border-red-500"; icon = <XCircle className="w-5 h-5 text-red-600"/>; }
                } else if (sel) { cls = "bg-indigo-50 border-indigo-500"; }
                return (
                  <button key={idx} onClick={()=>{ if (!drillShowRes) setDrillSel(idx); }} disabled={drillShowRes} className={`w-full text-left p-4 rounded-lg border-2 flex items-center justify-between ${cls}`}>
                    <span className="text-gray-800">{opt}</span>{icon}
                  </button>
                );
              })}
            </div>

            {drillShowRes && (
              <div className={`rounded-lg p-5 mb-6 border-2 ${isPremium ? 'bg-blue-50 border-blue-200' : 'bg-indigo-50 border-indigo-200'}`}>
                {isPremium ? (
                  <>
                    <div className="flex items-center gap-2 mb-3"><Crown className="w-5 h-5 text-yellow-500"/><span className="font-semibold text-gray-800">Premium Explanation</span></div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-3">
                      <div className="flex items-center gap-2 mb-1"><CheckCircle className="w-4 h-4 text-green-600"/><span className="font-semibold text-green-800 text-sm">Why the correct answer is right:</span></div>
                      <p className="text-gray-700 text-sm">This answer correctly identifies the core issue. It accurately reflects what the question is asking without adding unsupported inferences or misrepresenting the scope of the claim.</p>
                    </div>
                    {drillSel !== drillQ.correct && (
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center gap-2 mb-1"><XCircle className="w-4 h-4 text-red-600"/><span className="font-semibold text-red-800 text-sm">Why your answer was incorrect:</span></div>
                        <p className="text-gray-700 text-sm">This answer misidentifies the key issue. While it may seem plausible, it either overstates, understates, or shifts focus away from the primary concern the question targets.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5"/>
                    <div>
                      <p className="font-semibold text-gray-800 mb-1 flex items-center gap-2">Detailed Explanations <Crown className="w-4 h-4 text-yellow-500"/></p>
                      <p className="text-gray-600 text-sm mb-3">Upgrade to Premium to see why each answer is right or wrong after every question.</p>
                      <button onClick={()=>upgrade(true)} className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-700">Upgrade to Premium - $45/month</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between">
              {!drillShowRes ? (
                <button onClick={submitDrill} disabled={drillSel === null} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed">Submit Answer</button>
              ) : (
                <button onClick={nextDrillQ} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 flex items-center justify-center gap-2">Next Question <ChevronRight className="w-5 h-5"/></button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!section) {
    const SECTIONS = {
      lr:{name:"Logical Reasoning",icon:Brain,desc:"Analyze arguments and identify reasoning patterns",count:50},
      rc:{name:"Reading Comprehension",icon:BookOpen,desc:"Analyze complex passages and answer questions",count:50},
    };
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-4 mb-8 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-3"><User className="w-8 h-8 text-indigo-600"/><div><p className="font-semibold text-gray-800">{user.username}</p><p className="text-sm text-gray-600">{user.email}</p></div></div>
            <div className="flex items-center gap-2 flex-wrap">
              {user.isPremium&&<span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1"><Crown className="w-4 h-4"/>Premium</span>}
              <button onClick={()=>setShowProgress(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-semibold"><CheckCircle className="w-4 h-4"/>My Progress</button>
              <button onClick={()=>{setShowExplanations(true);setExplainFilter('all');}} className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-semibold"><Crown className="w-4 h-4"/>Explanation Bank</button>
              <button onClick={()=>setShowAccount(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold"><User className="w-4 h-4"/>My Account</button>
              <button onClick={()=>setShowTerms(true)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">Terms</button>
              <button onClick={doLogout} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"><LogOut className="w-4 h-4"/>Logout</button>
            </div>
          </div>
          <div className="text-center mb-8"><h1 className="text-4xl font-bold text-gray-800 mb-3">Specter LSAT Prep</h1><p className="text-gray-500">2,600 questions per section -- 100 practice tests of 26 questions each</p></div>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <button onClick={()=>{setShowLearn(true);setLearnSec(null);setLearnArt(null);}} className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg p-8 hover:shadow-xl text-white text-center"><div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4"><BookOpen className="w-6 h-6"/></div><h2 className="text-xl font-bold mb-2">Learn</h2><p className="text-emerald-100 text-sm mb-4">Strategy guides for every question type</p><div className="text-emerald-200 text-sm font-semibold">3 Sections -- 25 Articles -- Free for all users</div></button>
            <button onClick={()=>canAccess?startTimed():setShowAccess(true)} className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-lg p-8 hover:shadow-xl text-white text-center relative">{!canAccess&&<Lock className="w-5 h-5 text-white opacity-70 absolute top-4 right-4"/>}<div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4"><List className="w-6 h-6"/></div><h2 className="text-xl font-bold mb-2">Timed Full Test</h2><p className="text-indigo-100 text-sm mb-4">Real LSAT conditions, 3 sections</p><div className="text-indigo-200 text-sm font-semibold">78 Questions -- 35 min each</div></button>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <button onClick={()=>{setShowDrill(true);setDrillType(null);setDrillQ(null);setDrillSel(null);setDrillShowRes(false);setDrillScore({correct:0,total:0});setDrillHistory([]);}} className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg p-8 hover:shadow-xl text-white text-center col-span-full">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4"><Brain className="w-6 h-6"/></div>
              <h2 className="text-xl font-bold mb-2">Drill Mode</h2>
              <p className="text-orange-100 text-sm mb-4">Random questions from the full bank -- free for everyone, explanations for Premium</p>
              <div className="text-orange-200 text-sm font-semibold">LR -- RC -- Mixed -- Free for all users</div>
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(SECTIONS).map(([key,sec])=>{
              const Icon=sec.icon; const bg=key==="lr"?"bg-gradient-to-br from-blue-900 to-blue-800":"bg-gradient-to-br from-red-500 to-red-600";
              return <button key={key} onClick={()=>canAccess?setSection(key):setShowAccess(true)} className={`${bg} rounded-xl shadow-lg p-8 hover:shadow-xl text-white text-center relative`}>{!canAccess&&<Lock className="w-5 h-5 text-white opacity-70 absolute top-4 right-4"/>}<Icon className="w-12 h-12 text-white mx-auto mb-4"/><h2 className="text-xl font-bold mb-2">{sec.name}</h2><p className="text-blue-200 text-sm mb-4">{sec.desc}</p><div className="text-white text-sm font-semibold">1,300 Questions -- {sec.count} Tests</div>{!canAccess&&<div className="mt-3 text-xs text-blue-200">Subscription Required</div>}</button>;
            })}
          </div>
        </div>
        {showPaywall&&<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl text-center"><Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4"/><h2 className="text-2xl font-bold text-gray-800 mb-2">Unlock Premium Explanations</h2><p className="text-gray-600 mb-6">Get detailed explanations for every answer</p><div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white mb-6"><div className="text-5xl font-bold">$45</div><div>per month</div></div><button onClick={()=>upgrade(true)} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 mb-3">Subscribe - $45/month</button><button onClick={()=>setShowPaywall(false)} className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold">Maybe Later</button></div></div>}
        {showAccess&&<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl"><div className="text-center mb-6"><Lock className="w-12 h-12 text-indigo-600 mx-auto mb-3"/><h2 className="text-2xl font-bold text-gray-800">Choose Your Plan</h2></div><div className="grid grid-cols-2 gap-4 mb-4"><div className="border-2 border-gray-200 rounded-xl p-5"><div className="text-3xl font-bold mb-1">$35</div><div className="text-gray-500 text-sm mb-3">per month</div><div className="font-bold mb-3">Test Access</div><div className="space-y-2 text-sm mb-4"><div className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5"/><span>All 2,600 questions</span></div><div className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5"/><span>100 practice tests</span></div><div className="flex gap-2"><XCircle className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5"/><span className="text-gray-400">No explanations</span></div></div><button onClick={()=>upgrade(false)} className="w-full bg-gray-800 text-white py-2 rounded-lg font-semibold hover:bg-gray-900 text-sm">Get Access</button></div><div className="border-2 border-indigo-500 rounded-xl p-5 bg-indigo-50 relative"><div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full font-bold">BEST VALUE</div><div className="text-3xl font-bold mb-1">$45</div><div className="text-gray-500 text-sm mb-3">per month</div><div className="font-bold mb-3">Premium</div><div className="space-y-2 text-sm mb-4"><div className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5"/><span>All 2,600 questions</span></div><div className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5"/><span>100 practice tests</span></div><div className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5"/><span className="font-semibold">Full explanations</span></div></div><button onClick={()=>upgrade(true)} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 text-sm">Get Premium</button></div></div><button onClick={()=>setShowAccess(false)} className="w-full text-gray-500 hover:text-gray-700 font-semibold">Maybe Later</button></div></div>}
        {showTerms&&<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl"><h2 className="text-2xl font-bold mb-4">Terms of Service</h2><div className="text-sm text-gray-700 space-y-3 max-h-64 overflow-y-auto"><p><strong>1.</strong> By using Specter LSAT Prep, you agree to these Terms.</p><p><strong>2.</strong> Test Access ($35/mo): all questions and tests. Premium ($45/mo): adds detailed explanations.</p><p><strong>3. NO REFUNDS ARE PROVIDED.</strong></p><p><strong>4.</strong> Governed by laws of Florida, USA.</p><p><strong>5.</strong> specterlsatprep@gmail.com</p></div><button onClick={()=>setShowTerms(false)} className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700">Close</button></div></div>}
        {showAccount&&<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl"><div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-gray-800">My Account</h2><button onClick={()=>{setShowAccount(false);setShowCancel(false);}} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">x</button></div>{!showCancel?(<><div className="space-y-3 mb-6">{[["Username",user.username],["Email",user.email||"Not provided"],["Member Since",user.createdAt?new Date(user.createdAt).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}):"N/A"],["Tests Completed",`${Object.keys(completed).length} practice test${Object.keys(completed).length!==1?"s":""}`]].map(([l,v])=><div key={l} className="bg-gray-50 rounded-xl p-4"><p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">{l}</p><p className="text-gray-800 font-medium">{v}</p></div>)}<div className="bg-gray-50 rounded-xl p-4"><p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Subscription</p>{user.isAdmin?<span className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full font-bold">Admin</span>:user.isPremium?<span className="bg-yellow-400 text-gray-900 text-xs px-3 py-1 rounded-full font-bold">Premium - $45/month</span>:user.hasTestAccess?<span className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-bold">Test Access - $35/month</span>:<span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-bold">Free</span>}</div></div><div className="space-y-3">{(user.isPremium||user.hasTestAccess)&&!user.isAdmin&&<button onClick={()=>setShowCancel(true)} className="w-full py-3 rounded-xl font-semibold border-2 border-red-300 text-red-600 hover:bg-red-50">Cancel Subscription</button>}<button onClick={()=>{setShowAccount(false);doLogout();}} className="w-full py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center gap-2"><LogOut className="w-4 h-4"/>Sign Out</button></div></>):(<div className="text-center"><h3 className="text-xl font-bold text-gray-800 mb-2">Cancel Your Subscription?</h3><p className="text-gray-600 mb-2">You will lose access at the end of your current billing period.</p><p className="text-sm text-gray-500 mb-6">You can cancel directly through Stripe's secure customer portal. No need to contact us.</p><div className="space-y-3"><a href="https://billing.stripe.com/p/login/3cI7sE2wgbsg9uveXJ7EQ00" target="_blank" rel="noopener noreferrer" className="w-full py-3 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700 block text-center">Manage Subscription in Stripe</a><button onClick={()=>setShowCancel(false)} className="w-full py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200">Keep My Subscription</button></div></div>)}</div></div>}
      </div>
    );
  }

  // TEST SELECTION
  const SECS = { lr:{name:"Logical Reasoning",icon:Brain,count:50}, rc:{name:"Reading Comprehension",icon:BookOpen,count:50} };
  if (testIdx === null) {
    const sec = SECS[section]; const Icon = sec.icon;
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-5xl mx-auto">
          <button onClick={()=>setSection(null)} className="text-indigo-600 hover:text-indigo-800 mb-6 flex items-center">Back to Sections</button>
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8"><div className="flex items-center gap-4"><Icon className="w-10 h-10 text-indigo-600"/><div><h2 className="text-3xl font-bold text-gray-800">{sec.name}</h2><p className="text-gray-600">Select a practice test -- 26 questions each</p></div></div></div>
          <div className="grid md:grid-cols-3 gap-4">
            {Array.from({length:sec.count},(_,i)=>{
              const tk=`${section}-${i}`; const done=completed[tk];
              return <button key={i} onClick={()=>{setTestIdx(i);setQIdx(0);setAnswers({});setShowRes(false);setSelAns(null);}} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:bg-indigo-50 border-2 border-transparent hover:border-indigo-300 relative">{done&&<CheckCircle className="w-6 h-6 text-green-600 absolute top-2 right-2"/>}<List className="w-8 h-8 text-indigo-600 mx-auto mb-3"/><h3 className="text-lg font-bold text-gray-800">Practice Test {i+1}</h3><p className="text-sm text-gray-600 mt-1">Questions {i*26+1}--{(i+1)*26}</p>{done&&<p className="text-xs text-green-600 mt-2 font-semibold">Completed</p>}</button>;
            })}
          </div>
        </div>
      </div>
    );
  }

  // QUESTION SCREEN
  const qs = getQs(section, testIdx); const q = qs[qIdx];
  if (!q) return <div className="p-8 text-center text-gray-600">Loading...</div>;
  const prog = (qIdx + 1) / qs.length * 100;
  const allDone = Object.keys(answers).length === qs.length;
  const sc = { correct: Object.keys(answers).filter(k=>answers[k]===qs[+k]?.correct).length, total: qs.length };
  const tk = `${section}-${testIdx}`; const isDone = completed[tk];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <button onClick={()=>{setTestIdx(null);setQIdx(0);setAnswers({});setShowRes(false);setSelAns(null);}} className="text-indigo-600 hover:text-indigo-800 mb-4 flex items-center">Back to Practice Tests</button>
          <div className="flex justify-between items-center mb-3">
            <div><h2 className="text-2xl font-bold text-gray-800">{SECS[section].name}</h2><p className="text-sm text-gray-600">Practice Test {testIdx+1}</p></div>
            <span className="text-gray-600">Question {qIdx+1} of {qs.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6"><div className="bg-indigo-600 h-2 rounded-full" style={{width:`${prog}%`}}/></div>
          <div className="bg-gray-50 rounded-lg p-6 mb-6"><p className="text-gray-800 leading-relaxed">{q.passage}</p></div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{q.question}</h3>
          <div className="space-y-3 mb-6">
            {q.options.map((opt,idx)=>{
              const s=selAns===idx; const c=idx===q.correct; let cls="bg-white hover:bg-gray-50 border-gray-300"; let ico=null;
              if(showRes){if(c){cls="bg-green-50 border-green-500";ico=<CheckCircle className="w-5 h-5 text-green-600"/>;}else if(s){cls="bg-red-50 border-red-500";ico=<XCircle className="w-5 h-5 text-red-600"/>;}}else if(s){cls="bg-indigo-50 border-indigo-500";}
              return <button key={idx} onClick={()=>{if(!showRes){setSelAns(idx);setAnswers(a=>({...a,[qIdx]:idx}));}}} disabled={showRes} className={`w-full text-left p-4 rounded-lg border-2 flex items-center justify-between ${cls}`}><span className="text-gray-800">{opt}</span>{ico}</button>;
            })}
          </div>

          {showRes&&(
            <div className={`rounded-lg p-6 mb-6 border-2 ${user.isPremium&&isDone?"bg-blue-50 border-blue-200":"bg-indigo-50 border-indigo-200"}`}>
              {user.isPremium&&isDone?(<>
                <div className="flex items-center gap-2 mb-4"><Crown className="w-5 h-5 text-yellow-500"/><span className="font-semibold text-gray-800">Premium Explanations</span></div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-3"><div className="flex items-center gap-2 mb-2"><CheckCircle className="w-5 h-5 text-green-600"/><span className="font-semibold text-green-800">Why the correct answer is right:</span></div><p className="text-gray-700 text-sm">This answer correctly identifies the core issue. It accurately reflects what the question is asking without adding unsupported inferences or misrepresenting the scope of the claim.</p></div>
                {selAns!==q.correct&&<div className="p-4 bg-red-50 rounded-lg border border-red-200"><div className="flex items-center gap-2 mb-2"><XCircle className="w-5 h-5 text-red-600"/><span className="font-semibold text-red-800">Why your answer was incorrect:</span></div><p className="text-gray-700 text-sm">This answer misidentifies the key issue. While it may seem plausible, it either overstates, understates, or shifts focus away from the primary concern the question targets.</p></div>}
              </>):(
                <div className="flex items-start gap-4"><Lock className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1"/>
                  <div><h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">Detailed Explanations<Crown className="w-5 h-5 text-yellow-500"/></h4>
                  <p className="text-gray-700 text-sm mb-3">{!isDone?"Complete all 26 questions to unlock explanations with Premium.":"Upgrade to Premium to access detailed explanations."}</p>
                  {isDone&&<button onClick={()=>setShowPaywall(true)} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-700">Unlock Explanations -- $45/month</button>}</div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3 justify-between">
            <button onClick={()=>{if(qIdx>0){setQIdx(q=>q-1);setSelAns(answers[qIdx-1]??null);setShowRes(false);}}} disabled={qIdx===0} className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50">Previous</button>
            <div className="flex gap-3">
              {!showRes&&selAns!==null&&<button onClick={()=>setShowRes(true)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Submit Answer</button>}
              {showRes&&qIdx<qs.length-1&&<button onClick={()=>{setQIdx(q=>q+1);setSelAns(answers[qIdx+1]??null);setShowRes(false);}} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center">Next<ChevronRight className="w-4 h-4 ml-1"/></button>}
              {qIdx===qs.length-1&&<button onClick={()=>{setQIdx(0);setAnswers({});setShowRes(false);setSelAns(null);}} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"><RotateCcw className="w-4 h-4 mr-2"/>Restart</button>}
            </div>
          </div>

          {qIdx===qs.length-1&&showRes&&allDone&&(
            <div className="mt-6 p-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white text-center">
              <h3 className="text-2xl font-bold mb-2">Test Complete!</h3>
              <p className="text-lg">Score: {sc.correct} / {sc.total}</p>
              <p className="text-sm mt-1 opacity-90">{Math.round(sc.correct/sc.total*100)}% Correct</p>
              {!isDone&&<button onClick={()=>{
                  setCompleted(c=>({...c,[tk]:true}));
                  const missedTypes = Object.keys(answers).filter(k=>answers[k]!==qs[+k]?.correct).map(k=>{
                    const q=qs[+k]; if(!q) return null;
                    const t=q.question.toLowerCase();
                    if(t.includes('flaw')||t.includes('vulnerable')) return 'Flaw';
                    if(t.includes('assumption')) return 'Assumption';
                    if(t.includes('strengthen')) return 'Strengthen';
                    if(t.includes('weaken')) return 'Weaken';
                    if(t.includes('must be true')||t.includes('inferred')||t.includes('conclude')) return 'Inference';
                    if(t.includes('parallel')) return 'Parallel Reasoning';
                    if(t.includes('principle')) return 'Principle';
                    if(t.includes('method')||t.includes('proceeds by')) return 'Method';
                    if(t.includes('main point')||t.includes('primary purpose')) return 'Main Point';
                    if(t.includes('function')||t.includes('primarily in order to')) return 'Function';
                    if(t.includes('author')) return 'Author Attitude';
                    if(t.includes('structure')||t.includes('organization')) return 'Structure';
                    return section==='lr'?'Logical Reasoning':'Reading Comprehension';
                  }).filter(Boolean);
                  const typeCounts={};
                  missedTypes.forEach(t=>{typeCounts[t]=(typeCounts[t]||0)+1;});
                  const missedQs = Object.keys(answers).filter(k=>answers[k]!==qs[+k]?.correct).map(k=>({
                    id: tk + '_' + k,
                    source: 'test',
                    sourceLabel: (section==='lr'?'Logical Reasoning':'Reading Comprehension') + ' -- Test ' + (testIdx+1),
                    date: new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),
                    passage: qs[+k]?.passage,
                    question: qs[+k]?.question,
                    options: qs[+k]?.options,
                    correct: qs[+k]?.correct,
                    chosen: answers[k],
                  }));
                  const entry={section,testNum:testIdx+1,score:sc.correct,total:sc.total,pct:Math.round(sc.correct/sc.total*100),date:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),missedTypes:typeCounts,missedQs};
                  setTestHistory(h=>({...h,[tk]:entry}));
                  if (missedQs.length > 0) {
                    setDrillMissed(prev => {
                      const existingIds = new Set(prev.map(q=>q.id));
                      const newMissed = missedQs.filter(q=>!existingIds.has(q.id));
                      return [...newMissed, ...prev].slice(0, 500);
                    });
                  }
                }} className="mt-4 bg-white text-indigo-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100">Mark as Completed</button>}
              {isDone&&!user.isPremium&&<button onClick={()=>setShowPaywall(true)} className="mt-4 bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg font-semibold flex items-center gap-2 mx-auto"><Crown className="w-5 h-5"/>Unlock Explanations</button>}
            </div>
          )}
        </div>
      </div>
      {showPaywall&&<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl text-center"><Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4"/><h2 className="text-2xl font-bold text-gray-800 mb-2">Unlock Premium Explanations</h2><p className="text-gray-600 mb-6">Get detailed explanations for every answer</p><div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white mb-6"><div className="text-5xl font-bold">$45</div><div>per month</div></div><button onClick={()=>upgrade(true)} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 mb-3">Subscribe - $45/month</button><button onClick={()=>setShowPaywall(false)} className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold">Maybe Later</button></div></div>}
      <Analytics />
    </div>
  );
}
