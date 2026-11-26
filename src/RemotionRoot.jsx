import { Composition } from "remotion";
import { TestComp } from "./TestComp";
import { Reels002 } from "./reels002/Reels002";
import { HEIGHT, TOTAL_FRAMES, WIDTH, FPS } from "./reels002/timings";
import { Reels003 } from "./reels003/Reels003";
import { HEIGHT as R3_H, TOTAL_FRAMES as R3_FRAMES, WIDTH as R3_W, FPS as R3_FPS } from "./reels003/timings";
import { Reels004 } from "./reels004/Reels004";
import { HEIGHT as R4_H, TOTAL_FRAMES as R4_FRAMES, WIDTH as R4_W, FPS as R4_FPS } from "./reels004/timings";
import { Reels005 } from "./reels005/Reels005";
import { HEIGHT as R5_H, TOTAL_FRAMES as R5_FRAMES, WIDTH as R5_W, FPS as R5_FPS } from "./reels005/timings";
import { Reels006 } from "./reels006/Reels006";
import { HEIGHT as R6_H, TOTAL_FRAMES as R6_FRAMES, WIDTH as R6_W, FPS as R6_FPS } from "./reels006/timings";
import { Reels007 } from "./reels007/Reels007";
import { HEIGHT as R7_H, TOTAL_FRAMES as R7_FRAMES, WIDTH as R7_W, FPS as R7_FPS } from "./reels007/timings";
import { AffiliateDemo, DURATION, FPS as DEMO_FPS, WIDTH as DEMO_W, HEIGHT as DEMO_H } from "./affiliate-demo/AffiliateDemo";
import { DramaSiangBolong } from "./drama/DramaSiangBolong";
import { FPS as DRAMA_FPS, HEIGHT as DRAMA_H, TOTAL_FRAMES as DRAMA_FRAMES, WIDTH as DRAMA_W } from "./drama/timings";
import { SulaimanSemut } from "./sulaiman/SulaimanSemut";
import { FPS as SUL_FPS, HEIGHT as SUL_H, TOTAL_FRAMES as SUL_FRAMES, WIDTH as SUL_W } from "./sulaiman/timings";
import { SulaimanFlow } from "./sulaimanflow/SulaimanFlow";
import { SulaimanStoryboard, STORYBOARD_FPS, STORYBOARD_HEIGHT, STORYBOARD_FRAMES, STORYBOARD_WIDTH } from "./sulaiman-storyboard/SulaimanStoryboard";
import { UmarStoryboard, UMAR_FPS, UMAR_HEIGHT, UMAR_FRAMES, UMAR_WIDTH } from "./umar-storyboard/UmarStoryboard";
import { UmarLight, UMARLIGHT_FPS, UMARLIGHT_HEIGHT, UMARLIGHT_FRAMES, UMARLIGHT_WIDTH } from "./umar-light/UmarLight";
import { SoftSkill } from "./softskill/SoftSkill";
import { FPS as SOFT_FPS, HEIGHT as SOFT_H, TOTAL_FRAMES as SOFT_FRAMES, WIDTH as SOFT_W } from "./softskill/timings";
import { FeedHariGuru } from "./feed-hari-guru/FeedHariGuru";
import { FeedHariGuru2, FeedHariGuru3 } from "./feed-hari-guru/FeedHariGuruSeries";
import { FeedHariGuru2Short, FeedHariGuru3Short, SERIES10_FPS, SERIES10_FRAMES, SERIES10_WIDTH, SERIES10_HEIGHT } from "./feed-hari-guru/FeedHariGuruSeries10";
import { FeedPuncakBulanGuru } from "./feed-hari-guru/FeedPuncakBulanGuru";
import { FPS as FEED_FPS, HEIGHT as FEED_H, TOTAL_FRAMES as FEED_FRAMES, WIDTH as FEED_W } from "./feed-hari-guru/timings";
import { Trial3D } from "./trial3d/TrialBridge";
import { Trial3DPart2 } from "./trial3d-part2/TrialBridge2";
import { IbuMisterius } from "./ibu-misterius/IbuBridge";

export const RemotionRoot = () => {
	return (
		<>
			<Composition
				id="Test"
				component={TestComp}
				durationInFrames={30}
				fps={30}
				width={540}
				height={960}
			/>
			<Composition
				id="Reels002"
				component={Reels002}
				durationInFrames={TOTAL_FRAMES}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
			/>
			<Composition
				id="Reels003"
				component={Reels003}
				durationInFrames={R3_FRAMES}
				fps={R3_FPS}
				width={R3_W}
				height={R3_H}
			/>
			<Composition
				id="Reels004"
				component={Reels004}
				durationInFrames={R4_FRAMES}
				fps={R4_FPS}
				width={R4_W}
				height={R4_H}
			/>
			<Composition
				id="Reels005"
				component={Reels005}
				durationInFrames={R5_FRAMES}
				fps={R5_FPS}
				width={R5_W}
				height={R5_H}
			/>
			<Composition
				id="Reels006"
				component={Reels006}
				durationInFrames={R6_FRAMES}
				fps={R6_FPS}
				width={R6_W}
				height={R6_H}
			/>
			<Composition
				id="Reels007"
				component={Reels007}
				durationInFrames={R7_FRAMES}
				fps={R7_FPS}
				width={R7_W}
				height={R7_H}
			/>
			<Composition
				id="AffiliateDemo"
				component={AffiliateDemo}
				durationInFrames={DURATION}
				fps={DEMO_FPS}
				width={DEMO_W}
				height={DEMO_H}
			/>
			<Composition
				id="DramaSiangBolong"
				component={DramaSiangBolong}
				durationInFrames={DRAMA_FRAMES}
				fps={DRAMA_FPS}
				width={DRAMA_W}
				height={DRAMA_H}
			/>
			<Composition
				id="SulaimanSemut"
				component={SulaimanSemut}
				durationInFrames={SUL_FRAMES}
				fps={SUL_FPS}
				width={SUL_W}
				height={SUL_H}
			/>
			<Composition
				id="SulaimanFlow"
				component={SulaimanFlow}
				durationInFrames={SUL_FRAMES}
				fps={SUL_FPS}
				width={SUL_W}
				height={SUL_H}
			/>
			<Composition
				id="SulaimanStoryboard"
				component={SulaimanStoryboard}
				durationInFrames={STORYBOARD_FRAMES}
				fps={STORYBOARD_FPS}
				width={STORYBOARD_WIDTH}
				height={STORYBOARD_HEIGHT}
			/>
			<Composition
				id="UmarStoryboard"
				component={UmarStoryboard}
				durationInFrames={UMAR_FRAMES}
				fps={UMAR_FPS}
				width={UMAR_WIDTH}
				height={UMAR_HEIGHT}
			/>
			<Composition
				id="UmarLight"
				component={UmarLight}
				durationInFrames={UMARLIGHT_FRAMES}
				fps={UMARLIGHT_FPS}
				width={UMARLIGHT_WIDTH}
				height={UMARLIGHT_HEIGHT}
			/>
			<Composition
				id="SoftSkill"
				component={SoftSkill}
				durationInFrames={SOFT_FRAMES}
				fps={SOFT_FPS}
				width={SOFT_W}
				height={SOFT_H}
			/>
			<Composition
				id="FeedHariGuru"
				component={FeedHariGuru}
				durationInFrames={FEED_FRAMES}
				fps={FEED_FPS}
				width={FEED_W}
				height={FEED_H}
			/>
			<Composition
				id="FeedHariGuru2"
				component={FeedHariGuru2}
				durationInFrames={FEED_FRAMES}
				fps={FEED_FPS}
				width={FEED_W}
				height={FEED_H}
			/>
			<Composition
				id="FeedHariGuru3"
				component={FeedHariGuru3}
				durationInFrames={FEED_FRAMES}
				fps={FEED_FPS}
				width={FEED_W}
				height={FEED_H}
			/>
			<Composition
				id="FeedHariGuru2Short"
				component={FeedHariGuru2Short}
				durationInFrames={SERIES10_FRAMES}
				fps={SERIES10_FPS}
				width={SERIES10_WIDTH}
				height={SERIES10_HEIGHT}
			/>
			<Composition
				id="FeedHariGuru3Short"
				component={FeedHariGuru3Short}
				durationInFrames={SERIES10_FRAMES}
				fps={SERIES10_FPS}
				width={SERIES10_WIDTH}
				height={SERIES10_HEIGHT}
			/>
			<Composition
				id="FeedPuncakBulanGuru"
				component={FeedPuncakBulanGuru}
				durationInFrames={FEED_FRAMES}
				fps={FEED_FPS}
				width={FEED_W}
				height={FEED_H}
			/>
			<Composition
				id="Trial3D"
				component={Trial3D}
				durationInFrames={360}
				fps={30}
				width={1080}
				height={1920}
			/>
			<Composition
				id="Trial3DPart2"
				component={Trial3DPart2}
				durationInFrames={600}
				fps={30}
				width={1080}
				height={1920}
			/>
			<Composition
				id="IbuMisterius"
				component={IbuMisterius}
				durationInFrames={2700}
				fps={30}
				width={1080}
				height={1920}
			/>
		</>
	);
};
